'''
Created on Dec 8, 2015

@author: Chao.Song
'''
import httplib
import urllib
import json
import logging

from chakraclient import client as chakra_client
from horizon.utils.memoized import memoized
from easystack_dashboard.api import base

LOG = logging.getLogger(__name__)

from django.conf import settings

class Account(base.APIResourceWrapper):
    _attrs = [
        'id',
        'balance',
        'ref_resource',
        'name',
        'total_pay',
    ]

class Invcode(base.APIResourceWrapper):
    _attrs = [
        'codetype',
        'create_at',
        'expired',
        'id',
        'invcode',
        'status',
        'use_at',
        'use_by',
        'worth',
    ]

class Payment(base.APIResourceWrapper):
    _attrs = [
        'account_id',
        'amount',
        'id',
        'pay_at',
        'ptype',
        'trade_num',
        'trade_success',
    ]


def account_list(request, query=None, params=None):
    accounts = chakraClient(request).account.list(query, params).get('accounts')
    return [Account(account) for account in accounts]


def account_get(request,account_id):
    account = chakraClient(request).account.get(account_id).get('accounts')
    return Account(account)


def account_create(request, **kwargs):
    account = chakraClient(request).account.create(**kwargs)
    return Account(account)


def account_delete(request, account_id):
    chakraClient(request).account.delete(account_id)


def invcode_list(request,query=None, params=None):
    invcodes = chakraClient(request).invcode.list(query, params).get('invcodes')
    return [Invcode(invcode) for invcode in invcodes]


def invcode_get(request,invcode_id):
    invcode = chakraClient(request).invcode.get(invcode_id)
    return Invcode(invcode)


@base.create_log_decorator(
    optype='Create', subject='Invitation Code', detail=None)
def invcode_create(request, **kwargs):
    invcode = chakraClient(request).invcode.create(**kwargs)
    return Invcode(invcode)


def invcode_check(request, invcode):
    resp_json = chakraClient(request).invcode.check(invcode)	
    return resp_json


def invcode_update(request, invcode, **kwargs):
    invcode = chakraChakraServiceClient(request).invcode.update(invcode, **kwargs)
    return Invcode(invcode)


def invcode_delete(request, invcode_id):
    chakraClient(request).invcode.delete(invcode_id)


def payment_list(request,query=None, params = None):
    payments = chakraClient(request).payment.list(query, params).get('payments')
    return [Payment(payment) for payment in payments]


def payment_get(request, payment_id):
    payment = chakraClient(request).payment.get(payment_id).get('payments')
    return Payment(payment)


def payment_create(request, **kwargs):
    payment = chakraChakraServiceClient(request).payment.create(**kwargs)
    return Payment(payment)


def payment_update(request, payment_id, **kwargs):
    payment = chakraChakraServiceClient(request).payment.update(payment_id, **kwargs)
    return Payment(payment)


def payment_delete(request, payment_id):
    chakraClient(request).payment.delete(payment_id)

@memoized
def chakraClient(request):
    """ Initialization of Chakra client.
    """
    if request.user.username == '':
        endpoint = getattr(settings, 'OPENSTACK_CHAKRA_URL')
        client = chakra_client.Client('2', endpoint,
                                    auth_url = getattr(settings, 'OPENSTACK_AUTH_URL'),
                                    username = getattr(settings, 'CHAKRA_USER'),
                                    password = getattr(settings, 'CHAKRA_PASSWORD'),
                                    tenant_name = 'services')
        return client
    else:
        endpoint = base.url_for(request, "account")
        insecure = getattr(settings, 'OPENSTACK_SSL_NO_VERIFY', False)
        cacert = getattr(settings, 'OPENSTACK_SSL_CACERT', None)
        return chakra_client.Client('2', endpoint,
                                token = request.user.token.id,
                                insecure = insecure,
                                cacert = cacert)


@memoized
def chakraChakraServiceClient(request):
    endpoint = getattr(settings, 'OPENSTACK_CHAKRA_URL')
    client = chakra_client.Client('2', endpoint,
                                auth_url = getattr(settings, 'OPENSTACK_AUTH_URL'),
                                username = getattr(settings, 'CHAKRA_USER'),
                                password = getattr(settings, 'CHAKRA_PASSWORD'),
                                tenant_name = 'services')
    return client				
