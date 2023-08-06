import base64
import dataclasses
import functools
import hashlib
import logging
import uuid
import json
import datetime
import multiprocessing

from django.http import HttpResponseBadRequest, HttpResponseForbidden, JsonResponse, HttpResponseNotFound, HttpRequest
from django.forms.models import model_to_dict
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.files.uploadedfile import UploadedFile

import qiniu
import requests
from requests.adapters import HTTPAdapter

from wedding99.config import TELEGRAM_TOKEN, TELEGRAM_NOTIFICATION_CHAT
from wedding99.config import QINIU_ACCESS_KEY, QINIU_SECRET_KEY, QINIU_BUCKET_NAME, QINIU_PUBLIC_URL

from .wxclient import wechat_client
from .models import RsvpResponse, HuntScore
from .facepp import facepp_api, FaceppAPIError
from .hunt_tasks import ALL_TASKS
from .ui_config import UI_CONFIGS


qiniu_auth = qiniu.Auth(QINIU_ACCESS_KEY, QINIU_SECRET_KEY)


# a weak signature check, to prevent API abuse by tencent server
def sigcheck(f):
    @functools.wraps(f)
    def wrapper(req: HttpRequest):
        expected_sig = hashlib.sha1(f'wedding99/{req.get_full_path()}/'.encode() + req.body)\
                              .hexdigest().lower()
        sig = req.headers['X-API-Sig'].strip().lower()
        if expected_sig != sig:
            return HttpResponseForbidden()
        return f(req)
    return wrapper


@require_http_methods(['GET'])
@sigcheck
def code2session(req):
    code = req.GET['code']
    result = wechat_client.wxa.code_to_session(code)
    return JsonResponse({
        'openid': result['openid'],
    })


@require_http_methods(['GET'])
@sigcheck
def global_config(_):
    return JsonResponse({
        'uiConfig': UI_CONFIGS,
    })


def _send_rsvp_notification(response: RsvpResponse):
    if not TELEGRAM_TOKEN or not TELEGRAM_NOTIFICATION_CHAT:
        return
    msg = f'{response.name}提交了回复：{response.to_message()}'

    def _send():
        requests.post(f'https://tg-api.proxy.wall.blahgeek.com/bot{TELEGRAM_TOKEN}/sendMessage', json={
            'chat_id': TELEGRAM_NOTIFICATION_CHAT,
            'text': msg,
        })
    multiprocessing.Process(target=_send).start()

@csrf_exempt
@require_http_methods(['POST', 'GET'])
@sigcheck
def rsvp(req: HttpRequest):
    openid = req.GET['openid']

    if req.method == 'GET':
        try:
            model = RsvpResponse.objects.get(openid=openid)
        except RsvpResponse.DoesNotExist:
            return HttpResponseNotFound()
    else:
        req_body = json.loads(req.body)
        if req_body.get('name', '') == '':
            return HttpResponseBadRequest()
        model, _ = RsvpResponse.objects.get_or_create(openid=openid)
        for k, v in req_body.items():
            setattr(model, k, v)
        model.save()
        _send_rsvp_notification(model)
    return JsonResponse(model_to_dict(model))


@csrf_exempt
@require_http_methods(['GET'])
@sigcheck
def get_hunt_tasks(req: HttpRequest):
    openid = req.GET['openid']
    return JsonResponse([dataclasses.asdict(x) for x in ALL_TASKS], safe=False)


@csrf_exempt
@require_http_methods(['POST'])
@sigcheck
def hunt_score(req: HttpRequest):
    openid = req.GET['openid']
    model, _ = HuntScore.objects.get_or_create(openid=openid)
    for k, v in json.loads(req.body).items():
        setattr(model, k, v)
    model.save()
    return JsonResponse(model_to_dict(model))


@require_http_methods(['GET'])
@sigcheck
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

    faceset_id = 'wedding99_' + datetime.datetime.now().strftime('%Y%m%d')
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
                'outer_id': faceset_id,
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
            'outer_id': faceset_id,
            'face_tokens': ','.join(new_face_tokens),
            'force_merge': 1,
        })

    return JsonResponse({
        'faces': result_faces,
        'url': QINIU_PUBLIC_URL + '/' + upload_key,
    })

