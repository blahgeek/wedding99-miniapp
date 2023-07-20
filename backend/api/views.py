import base64
import dataclasses
import uuid
import json
import concurrent.futures

from django.http import JsonResponse, HttpResponseNotFound, HttpRequest
from django.forms.models import model_to_dict
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.uploadedfile import UploadedFile

import qiniu
import requests

from wedding99.config import TELEGRAM_TOKEN, TELEGRAM_NOTIFICATION_CHAT
from wedding99.config import FACEPP_FACESET_ID
from wedding99.config import QINIU_ACCESS_KEY, QINIU_SECRET_KEY, QINIU_BUCKET_NAME, QINIU_PUBLIC_URL

from .wxclient import wechat_client
from .models import RsvpResponse, UiConfig, HuntScore
from .facepp import facepp_api, FaceppAPIError
from .hunt_tasks import ALL_TASKS


qiniu_auth = qiniu.Auth(QINIU_ACCESS_KEY, QINIU_SECRET_KEY)

@require_http_methods(['GET'])
def code2session(req):
    code = req.GET['code']
    result = wechat_client.wxa.code_to_session(code)
    return JsonResponse(result)


@require_http_methods(['GET'])
def global_config(_):
    ui_configs = UiConfig.objects.all()
    return JsonResponse({
        '_comment': '是的，这里能看到所有答案，不是服务端校验的，时间紧迫新郎繁忙，就这样吧。',
        'uiConfig': dict((c.key, c.value) for c in ui_configs),
    })


_notification_thread_pool = concurrent.futures.ThreadPoolExecutor(max_workers=1)

def _send_rsvp_notification(response: RsvpResponse):
    if not TELEGRAM_TOKEN or not TELEGRAM_NOTIFICATION_CHAT:
        return
    msg = f'{response.name}提交了回复：'
    if response.participate:
        msg += '确认参加; '
        if response.plusOne:
            msg += '携伴; '
        if response.needHotel:
            msg += f'需要酒店 {response.needHotelStartDate} 至 {response.needHotelEndDate}; '
    else:
        msg += '不参加; '
    if response.notes:
        msg += f'备注：{response.notes}'
    requests.post(f'https://tg-api.proxy.wall.blahgeek.com/bot{TELEGRAM_TOKEN}/sendMessage', data={
        'chat_id': TELEGRAM_NOTIFICATION_CHAT,
        'text': msg,
    })

@csrf_exempt
@require_http_methods(['POST', 'GET'])
def rsvp(req: HttpRequest):
    openid = req.GET['openid']

    if req.method == 'GET':
        try:
            model = RsvpResponse.objects.get(openid=openid)
        except RsvpResponse.DoesNotExist:
            return HttpResponseNotFound()
    else:
        model, _ = RsvpResponse.objects.get_or_create(openid=openid)
        for k, v in json.loads(req.body).items():
            setattr(model, k, v)
        model.save()
        _notification_thread_pool.submit(_send_rsvp_notification, model)
    return JsonResponse(model_to_dict(model))


@csrf_exempt
@require_http_methods(['GET'])
def get_hunt_tasks(req: HttpRequest):
    openid = req.GET['openid']
    return JsonResponse([dataclasses.asdict(x) for x in ALL_TASKS], safe=False)


@csrf_exempt
@require_http_methods(['POST'])
def hunt_score(req: HttpRequest):
    openid = req.GET['openid']
    model, _ = HuntScore.objects.get_or_create(openid=openid)
    for k, v in json.loads(req.body).items():
        setattr(model, k, v)
    model.save()
    return JsonResponse(model_to_dict(model))


@require_http_methods(['GET'])
def hunt_score_ranking(req: HttpRequest):
    return JsonResponse({
        'ranking': list(HuntScore.objects.order_by('-score').values('openid', 'name', 'score')),
    })


@csrf_exempt
@require_http_methods(['POST'])
def face_upload_and_detect(req: HttpRequest):
    image: UploadedFile = req.FILES['image']
    image_content = image.read()

    detect_resp = facepp_api('/v3/detect', {
        'image_base64': base64.b64encode(image_content),
    })
    upload_key = f'user_upload/{uuid.uuid4()}/{image.name}'
    upload_token = qiniu_auth.upload_token(QINIU_BUCKET_NAME, upload_key)
    qiniu.put_data(upload_token, upload_key, image_content,
                   mime_type=image.content_type or 'application/octet-stream')

    # for each face, search in existing faceset:
    # if not found, return it and add it to faceset;
    # if found, return the found face token.
    # So that, for the same person, we always return an unique id
    result_faces = []
    new_face_tokens = []
    for face in detect_resp['faces']:
        face_token = face['face_token']
        existing_face_token = None
        try:
            search_resp = facepp_api('/v3/search', {
                'face_token': face_token,
                'outer_id': FACEPP_FACESET_ID,
            })
            if search_resp['results'] and \
               search_resp['results'][0]['confidence'] > search_resp['thresholds']['1e-5']:
                existing_face_token = search_resp['results'][0]['face_token']
        except FaceppAPIError as e:
            if e.error_msg != 'INVALID_OUTER_ID':
                raise

        if existing_face_token is not None:
            result_faces.append(existing_face_token)
        else:
            result_faces.append(face_token)
            new_face_tokens.append(face_token)

    if new_face_tokens:
        facepp_api('/v3/faceset/create', {
            'outer_id': FACEPP_FACESET_ID,
            'face_tokens': ','.join(new_face_tokens),
            'force_merge': 1,
        })

    return JsonResponse({
        'faces': result_faces,
        'url': QINIU_PUBLIC_URL + '/' + upload_key,
    })

