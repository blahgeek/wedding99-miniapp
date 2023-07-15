#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests

from wedding99.config import FACEPP_API_KEY, FACEPP_API_SECRET


class FaceppAPIError(Exception):

    def __init__(self, error_msg: str):
        self.error_msg = error_msg

    def __str__(self):
        return f'FaceppAPIError: {self.error_msg}'


_session = requests.Session()

def facepp_api(url: str, data):
    resp = _session.post('https://api-cn.faceplusplus.com/facepp' + url,
                         data={
                             'api_key': FACEPP_API_KEY,
                             'api_secret': FACEPP_API_SECRET,
                             **data,
                         })
    result = resp.json()
    if 'error_message' in result:
        raise FaceppAPIError(result['error_message'])
    return result


