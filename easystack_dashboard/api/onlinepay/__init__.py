# -*- coding: utf-8 -*-
# Copyright 2015 Easystack <bo.wang@easystack.cn>
# Created on 2015-08-28


import abc
import json
import six

from django.core.urlresolvers import reverse
from django.http import HttpResponseRedirect, HttpResponse
from easystack_dashboard.api import chakra


@six.add_metaclass(abc.ABCMeta)
class OnlinePay(object):

    """Base class for all online pay platforms."""

    @abc.abstractmethod
    def get_pay_url(self, billing_trade_no, pay_value, subject, desc):
        pass

    @abc.abstractmethod
    def handle_reponse(self, data):
        pass

    def verify_update_payment(self, request, trade_no, amount, notify_type):
        payment = self._get_payment(request, trade_no)
        if payment and (amount == payment.amount):
            payment_id = payment.id
            return self._update_payment(request, payment_id, notify_type)
        return self.error(notify_type)

    def _get_payment(self, request, trade_no):
        query = [{"field": "trade_num",
                  "op": "eq",
                  "value": trade_no,
                  "type": "string"}]
        params = ["pagation.number=1",
                  "apgation.count=1",
                  "q.orderby=id",
                  "q.sort=dasc", ]
        payments = chakra.payment_list(request, query, params)
        if payments:
            payment = payments[0]
            return payment
        return None

    def _update_payment(self, request, payment_id, notify_type):
        body = {"trade_success": 1}
        payment = chakra.payment_update(request, payment_id, **body)
        if payment:
            return self._success(notify_type)
        return self.error(notify_type)

    def _success(self, notify_type):
        if notify_type == 'sync':
            return HttpResponseRedirect(reverse('horizon:project:billing:payment_success'))
        elif notify_type == 'async':
            return HttpResponse(200, "success")

    def error(self, notify_type):
        if notify_type == 'sync':
            return HttpResponseRedirect(reverse('horizon:project:billing:payment_error'))
        elif notify_type == 'async':
            return HttpResponse(500, "fail")
