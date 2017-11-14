# -*- coding: utf-8 -*-
__author__ = 'Maggie'
__date__ = "2015/08/01"

import hashlib


def getHmac(stringArr, keyValue):
    encoding_char = "utf-8"
    if stringArr == None or len(stringArr) == 0:
        return None
    str_all = ""
    for item in stringArr:
        str_all += item
    keyb = bytearray(keyValue, encoding=encoding_char)
    value = bytearray(str_all, encoding=encoding_char)

    k_ipad = [item ^ 0x36 for item in keyb]
    k_opad = [item ^ 0x5c for item in keyb]

    k_ipad += [54] * (64 - len(keyb))
    k_opad += [92] * (64 - len(keyb))

    key = hashlib.md5()
    key.update(str(bytearray(k_ipad)))
    key.update(str(value))
    dg = key.digest()

    key = hashlib.md5()
    key.update(str(bytearray(k_opad)))
    dg_new = dg[:16]
    key.update(str(dg_new))
    dg = key.hexdigest()

    return dg
