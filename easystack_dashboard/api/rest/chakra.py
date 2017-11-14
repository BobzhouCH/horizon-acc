'''
Created on 2015-12-14

@author: Chao.Song
'''

import json
import logging
import time

from datetime import datetime
from horizon import exceptions

from django.conf import settings
from django.views import generic
from django.utils.translation import ugettext_lazy as _

from easystack_dashboard.api import chakra
from easystack_dashboard.api.rest import urls
from easystack_dashboard.api.rest import utils as rest_utils

from easystack_dashboard.api.onlinepay.onlinepay_factory import OnlinePayFactory

log = logging.getLogger(__name__)

invcode_status = {-1: 'verify_failed',
                  0: 'available',
                  1: 'used',
                  2: 'overtime',
                  3: 'wrong_status'}

@urls.register
class Accounts(generic.View):
    url_regex = r'chakra/accounts/$'

    @rest_utils.ajax()
    def get(self, request):
        result = chakra.account_list(request)
        return {"items": [i.to_dict() for i in result]}

@urls.register
class Account(generic.View):
    url_regex = r'chakra/account/$'

    @rest_utils.ajax()
    def get(self, request):
        account = [get_account(request).to_dict()]
        return {"items": account}

    @rest_utils.ajax(data_required = True)
    def post(self,request):
        new_account = chakra.account_create(request, **request.DATA)
        items = [new_account.to_dict()]
        return {'items': items}


@urls.register
class Payment(generic.View):
    url_regex = r'chakra/payment/(?P<payment_id>.+|)$'

    @rest_utils.ajax()
    def get(self, request, payment_id):
        if payment_id == 'All':
            _account_id = get_account_id(request)
            if _account_id == None:
                return {"items": ""}
            query = [{"field": "account_id",
                     "op": "eq",
                     "value": _account_id,
                     "type": "number"}
                    ]
            params = ["pagation.number=1",
                      "apgation.count=1000",
                      "q.orderby=id",
                      "q.sort=dasc",]
            payments = chakra.payment_list(request, query, params)
            items = [p.to_dict() for p in payments]
            return {"items": items}
        else:
            query = [{"field": "id",
                     "op": "eq",
                     "value": int(payment_id),
                     "type": "number"}
                    ]
            params = ["pagation.number=1",
                      "apgation.count=1",
                      "q.orderby=id",
                      "q.sort=dasc",]
            payments = chakra.payment_list(request, query, params)
            items = [p.to_dict() for p in payments]
            return {"items": items}

    @rest_utils.ajax(data_required = True)
    def post(self, request, payment_id):
        requestData = request.DATA
        _account_id = get_account_id(request)
        if _account_id == None:
            raise exceptions.NotFound("Your User has no billing account.")
        if requestData.get("type")=="invcode":
            return create_invcode_payment(request, requestData.get('invcode'),  float(requestData.get('value')), _account_id)
        body = {'ptype': requestData.get('type'),
                'amount': float(requestData.get('value')),
                'account_id': _account_id}
        new_payment = chakra.payment_create(request, **body)
        items = new_payment.to_dict()
        tn = items.get('trade_num')
        pay_instance = OnlinePayFactory.get_instance(requestData.get("type"))
        pay_url = pay_instance.get_pay_url(tn, requestData.get('value'), getattr(settings, 'ALIPAY_SUBJECT'), None)
        return pay_url, items.get('id')


@urls.register
class Invcode(generic.View):
    url_regex = r'chakra/invcode/(?P<invcode>.+|)$'

    @rest_utils.ajax()
    def get(self, request, invcode):
        if (invcode==''):
            return {"items": []}
        try:
            result = chakra.invcode_check(request, invcode)
        except:
            return {"items": []}
        if not result:
            return {"items": []}
        else:
            result['status'] = str(result['status']).lower()
            return {"items": result}

    @rest_utils.ajax()
    def delete(self, request, invcode):
        chakra.invcode_delete(request, invcode)


@urls.register
class Invcodes(generic.View):
    url_regex = r'chakra/invcodes/$'
    @rest_utils.ajax()
    def get(self,request):
        invcodes = chakra.invcode_list(request)
        items = [i.to_dict() for i in invcodes]
        for item in items:
            item['status'] = invcode_status[item['status']]
            if(item['expired']):
                mkTime = time.mktime(time.strptime(item['expired'],'%Y-%m-%d %H:%M:%S'))
                expiredTime = int(round(mkTime*1000))
                nowTime = int(round(time.time() * 1000))
                if(nowTime > expiredTime):
                    item['status'] = 'overtime'

        return {"items": items}

    @rest_utils.ajax(data_required = True)
    def post(self, request):
        num = request.DATA.get('number')
        items = []
        for i in range(num):
            new_invcode = chakra.invcode_create(
                request,
                **request.DATA
            )
            _dic = new_invcode.to_dict()
            _dic['status'] = invcode_status[_dic['status']]
            items.append(_dic)
        return {"items": items}


def get_account(request):
    query = [
             {"field": "ref_resource",
             "op": "eq",
             "value": request.user.user_domain_id,
             "type": "str",}
            ]
    params = ["pagation.number=1",
              "apgation.count=1",
              "q.orderby=id",
              "q.sort=dasc",
              ]
    accounts = chakra.account_list(request, query, params)
    return accounts[0]


def get_account_id(request):
    _account_id = get_account(request).id
    return _account_id


def create_invcode_payment(request, invcode, worth, _account_id):
    use_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

    body = {'ptype': 'invcode',
            'amount': worth,
            'trade_success': 1,
            'account_id': _account_id}
    new_payment = chakra.payment_create(request, **body)
    _dict = new_payment.to_dict()
    chakra.invcode_update(request, invcode, status = 1, use_at = use_at, use_by = request.user.username)
    return {"items": _dict}
