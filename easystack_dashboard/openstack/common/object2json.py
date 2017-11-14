import json
from easystack_dashboard.openstack.common import format


def get_account(account):
    object_dict = {}
    if account:
        object_dict['id'] = account.id
        object_dict['name'] = account.name
        object_dict['balance'] = account.balance
        object_dict['ref_resource'] = account.ref_resource
    return object_dict


def get_account_json(account):
    return json.dumps(get_account(account))


def get_accounts_json(result):
    objects_list = []
    for account in result.results:
        objects_list.append(get_account(account))
    object_dict = {'accounts': objects_list}
    return json.dumps(dict(object_dict, **__get_pagation(result)))


def get_product(product):
    object_dict = {}
    if product:
        object_dict['id'] = product.id
        object_dict['resource_id'] = product.resource_id
        object_dict['fee'] = product.fee
        object_dict['cost'] = product.cost
        object_dict['unit'] = product.unit
        object_dict['provider'] = product.provider
        object_dict['update_at'] = format.date2str(product.update_at)
        object_dict['account_id'] = product.account_id
        object_dict['status'] = product.status
        object_dict['ptype'] = product.ptype
        object_dict['version'] = product.version
    return object_dict


def get_product_json(product):
    return json.dumps(get_product(product))


def get_products_json(result):
    objects_list = []
    for product in result.results:
        objects_list.append(get_product(product))
    object_dict = {'products': objects_list}
    return json.dumps(dict(object_dict, **__get_pagation(result)))


def get_billingItem(billingItem):
    object_dict = {}
    if billingItem:
        object_dict['id'] = billingItem.id
        object_dict['charge_from'] = format.date2str(billingItem.charge_from)
        object_dict['charge_to'] = format.date2str(billingItem.charge_to)
        object_dict['charge_fee'] = billingItem.charge_fee
        object_dict['product_id'] = billingItem.product_id
    return object_dict


def get_billingItem_json(billingItem):
    return json.dumps(get_billingItem(billingItem))


def get_billingItems_json(result):
    objects_list = []
    for billingItem in result.results:
        objects_list.append(get_billingItem(billingItem))
    object_dict = {'billingitems': objects_list}
    return json.dumps(dict(object_dict, **__get_pagation(result)))


def __get_pagation(result):
    pagation_dic = {}
    pagation_dic['pagation.total'] = result.total
    pagation_dic['pagation.number'] = result.query.number
    pagation_dic['pagation.count'] = result.query.count
    return pagation_dic


def get_price(price):
    object_dict = {}
    if price:
        object_dict['id'] = price.id
        object_dict['name'] = price.name
        object_dict['ptype'] = price.ptype
        object_dict['account_id'] = price.account_id
    return object_dict


def get_price_json(price):
    return json.dumps(get_price(price))


def get_prices_json(result):
    objects_list = []
    for price in result.results:
        objects_list.append(get_price(price))
    object_dict = {'prices': objects_list}
    return json.dumps(dict(object_dict, **__get_pagation(result)))


def get_priceItem(priceItem):
    object_dict = {}
    if priceItem:
        object_dict['id'] = priceItem.id
        if priceItem.rule:
            object_dict['rule'] = eval(priceItem.rule)
        else:
            object_dict['rule'] = priceItem.rule
        object_dict['ptype'] = priceItem.ptype
        object_dict['fee'] = priceItem.fee
        object_dict['unit'] = priceItem.unit
        object_dict['price_id'] = priceItem.price_id
    return object_dict


def get_priceItem_json(priceItem):
    return json.dumps(get_priceItem(priceItem))


def get_priceItems_json(result):
    objects_list = []
    for priceItem in result.results:
        objects_list.append(get_priceItem(priceItem))
    object_dict = {'priceitems': objects_list}
    return json.dumps(dict(object_dict, **__get_pagation(result)))


def get_payment(payment):
    object_dict = {}
    if payment:
        pay_at = format.date2str(payment.pay_at)
        object_dict['id'] = payment.id
        object_dict['pay_at'] = pay_at
        object_dict['ptype'] = payment.ptype
        object_dict['amount'] = payment.amount
        object_dict['account_id'] = payment.account_id
    return object_dict


def get_payment_json(payment):
    return json.dumps(get_payment(payment))


def get_payments_json(result):
    objects_list = []
    for payment in result.results:
        objects_list.append(get_payment(payment))
    object_dict = {'payments': objects_list}
    return json.dumps(dict(object_dict, **__get_pagation(result)))
