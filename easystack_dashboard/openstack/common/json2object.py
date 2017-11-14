from easystack_dashboard.openstack.common.models import Account
from easystack_dashboard.openstack.common.models import Product
from easystack_dashboard.openstack.common.models import Price
from easystack_dashboard.openstack.common.models import PriceItem
from easystack_dashboard.openstack.common.models import Payment
from easystack_dashboard.openstack.common.models import billingItem as BillingItem
from easystack_dashboard.openstack.common import format


def get_account(account):
    for key in Account(None, None, None, None).__dict__:
        if key not in account:
            account[key] = None
    return Account(pid=account['id'],
                   name=account['name'],
                   balance=account['balance'],
                   ref_resource=account['ref_resource'])


def get_product(product):
    pid = None
    if 'id' in product:
        pid = product['id']
    version = None
    if 'version' in product:
        version = product['version']
    update_at = None
    if 'update_at' in product:
        update_at = format.str2date(product['update_at'])
    cost = 0
    if 'cost' in product:
        cost = product['cost']
    return Product(pid=pid,
                   resource_id=product['resource_id'],
                   fee=product['fee'],
                   cost=cost,
                   unit=product['unit'],
                   provider=product['provider'],
                   update_at=update_at,
                   status=product['status'],
                   ptype=product['ptype'],
                   version=version,
                   account_id=product['account_id'])


def get_price(price):
    for key in Price(None, None, None, None).__dict__:
        if key not in price:
            price[key] = None
    return Price(pid=price['id'],
                 name=price['name'],
                 ptype=price['ptype'],
                 account_id=price['account_id'])


def get_priceItem(priceItem):
    for key in PriceItem(None, None, None, None, None, None).__dict__:
        if key not in priceItem:
            priceItem[key] = None
    if priceItem['rule']:
        priceItem['rule'] = str(priceItem['rule'])
    return PriceItem(pid=priceItem['id'],
                     rule=priceItem['rule'],
                     ptype=priceItem['ptype'],
                     fee=priceItem['fee'],
                     unit=priceItem['unit'],
                     price_id=priceItem['price_id'])


def get_payment(payment):
    pid = None
    pay_at = None
    if 'id' in payment:
        pid = payment['id']
    if 'pay_at' in payment:
        pay_at = payment['pay_at']
    return Payment(pid=pid,
                   pay_at=pay_at,
                   ptype=payment['ptype'],
                   amount=payment['amount'],
                   account_id=payment['account_id'])


def get_billingItem(billingItem):
    for key in BillingItem(None, None, None, None, None).__dict__:
        if key not in billingItem:
            billingItem[key] = None
    return BillingItem(pid=billingItem['id'],
                       charge_from=billingItem['charge_from'],
                       charge_to=billingItem['charge_to'],
                       charge_fee=billingItem['charge_fee'],
                       product_id=billingItem['product_id'])
