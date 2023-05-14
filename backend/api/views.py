import json
import threading

from django.http import JsonResponse, HttpResponseNotFound, HttpRequest
from django.forms.models import model_to_dict
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from wechatpy import WeChatClient

from wedding99.config import WX_APP_API, WX_APP_SECRET

from .models import RsvpResponse


wechat_client = WeChatClient(WX_APP_API, WX_APP_SECRET)
wechat_client_lock = threading.Lock()

@csrf_exempt
@require_http_methods(['GET'])
def code2session(req):
    code = req.GET['code']
    with wechat_client_lock:
        result = wechat_client.wxa.code_to_session(code)
    return JsonResponse(result)

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
    return JsonResponse(model_to_dict(model))

