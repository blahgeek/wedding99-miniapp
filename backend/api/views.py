import json
import threading
import concurrent.futures

from django.http import JsonResponse, HttpResponseNotFound, HttpRequest
from django.forms.models import model_to_dict
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

import requests
from wechatpy import WeChatClient

from wedding99.config import WX_APP_API, WX_APP_SECRET, TELEGRAM_TOKEN, TELEGRAM_NOTIFICATION_CHAT

from .models import RsvpResponse, UiConfig, HuntQuestion, HuntScore


wechat_client = WeChatClient(WX_APP_API, WX_APP_SECRET)
wechat_client_lock = threading.Lock()

@require_http_methods(['GET'])
def code2session(req):
    code = req.GET['code']
    with wechat_client_lock:
        result = wechat_client.wxa.code_to_session(code)
    return JsonResponse(result)


@require_http_methods(['GET'])
def global_config(_):
    ui_configs = UiConfig.objects.all()
    hunt_questions = HuntQuestion.objects.all()
    return JsonResponse({
        '_comment': '是的，这里能看到所有答案，不是服务端校验的，时间紧迫新郎繁忙，就这样吧。',
        'uiConfig': dict((c.key, c.value) for c in ui_configs),
        'huntQuestions': dict((q.question_id, {
            'questionRichContent': q.question_rich_content,
            'answers': [q.answer0, q.answer1, q.answer2, q.answer3],
            'correctAnswer': q.correct_answer,
            'explanation': q.explanation,
        }) for q in hunt_questions),
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
@require_http_methods(['POST'])
def hunt_score(req: HttpRequest):
    openid = req.GET['openid']
    model, _ = HuntScore.objects.get_or_create(openid=openid)
    for k, v in json.loads(req.body).items():
        setattr(model, k, v)
    model.save()
    return JsonResponse(model_to_dict(model))

