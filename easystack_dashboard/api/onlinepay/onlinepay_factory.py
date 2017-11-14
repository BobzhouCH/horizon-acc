# -*- coding: utf-8 -*-
# Copyright 2015 Easystack <bo.wang@easystack.cn>
# Created on 2015-08-28

from easystack_dashboard.api.onlinepay.alipay import alipay
from easystack_dashboard.api.onlinepay.yeepay import yeepay


class OnlinePayFactory(object):

    @staticmethod
    def get_instance(pay_type):
        _dic = {"alipay": alipay.AliPay(),
                "yeepay": yeepay.YeePay()}

        return _dic.get(pay_type)