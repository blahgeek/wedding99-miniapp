#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from wechatpy import WeChatClient
from wechatpy.session import SessionStorage

from wedding99.config import WX_APP_API, WX_APP_SECRET
from .models import SessionKV


class DBSessionStorage(SessionStorage):

    def get(self, key, default=None):
        try:
            return SessionKV.objects.get(key=key).value
        except SessionKV.DoesNotExist:
            return default

    def set(self, key, value, ttl=None):
        del ttl
        SessionKV.objects.update_or_create(key=key, defaults={'value': value})

    def delete(self, key):
        SessionKV.objects.filter(key=key).delete()


wechat_client = WeChatClient(WX_APP_API, WX_APP_SECRET, session=DBSessionStorage())
