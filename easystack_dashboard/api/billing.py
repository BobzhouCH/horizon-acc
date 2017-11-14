import httplib
import urllib
import json
import datetime
import logging

from easystack_dashboard.api import chakra
from billingclient import client as billing_client
from horizon.utils.memoized import memoized
from easystack_dashboard.api import base

LOG = logging.getLogger(__name__)

from django.conf import settings  # noqa
from horizon import exceptions
from easystack_dashboard import policy
from easystack_dashboard.api import keystone


def get_active_pricefixing(request):
    try:
        pricefixings = pricefixing_list(request)
        items = [i.to_dict() for i in pricefixings]
        for item in items:
            if item.get('is_active'):
                fix_id = item.get('id')
                return fix_id
    except:
        return None


def get_current_price(query, request):
    try:
        fix_id = None
        pricefixings = pricefixing_list(request, query)
        items = [i.to_dict() for i in pricefixings]
        for item in items:
            if item.get('is_active'):
                fix_id = item.get('id')
                break
        if fix_id:
            query = [{
                      "field": "price_fixing_id",
                      "op": "eq",
                      "value": int(fix_id),
                      "type": "number",
                    }]
            param = ["pagation.number=1",
                     "pagation.count=1000",
                     "q.orderby=price_item.id",
                     "q.sort=asc"]
            priceitems = priceitem_list(request, query, param)
            priceitems = [p.to_dict() for p in priceitems]
            return priceitems
    except:
        return None


def check_tenant_billing_enable(request):
    query = [{"field": "ref_resource",
             "op": "eq",
             "value": request.user.tenant_id,
             "type": "str",
            }]
    params = ["pagation.number=1",
              "pagation.count=1000",
              "q.orderby=id",
              "q.sort=asc",
              ]
    try:
        accounts = chakra.account_list(request, query, params)
        for account in accounts:
            if account['ref_resource'] == request.user.tenant_id:
                return True
            else:
                return False
    except:
        return False

def get_account_id(request, domain_id=None):
    if domain_id is None:
        ref = request.user.user_domain_id
    else:
        ref = domain_id
    query = [{"field": "account.ref_resource",
             "op": "eq",
             "value": ref,
             "type": "string",
             }]
    params = ["pagation.number=1",
             "pagation.count=1",
             "q.orderby=account.id",
             "q.sort=asc"]
    try:
        account = chakra.account_list(request, query, params)
        account = [a.to_dict() for a in account]
        if len(account) == 0:
            raise exceptions.NotFound("Can't find account of current user")
        return account[0].get('id')
    except:
        raise exceptions.NotFound("Can't find account of current user")

def get_balance(request):
    domain_id = request.user.user_domain_id
    query = [{"field": "account.ref_resource",
             "op": "eq",
             "value": domain_id,
             "type": "string",}]
    param = ["pagation.number=1",
             "pagation.count=1",
             "q.orderby=account.id",
             "q.sort=asc"]
    try:
        items = chakra.account_list(request, query, param)
        items = [i.to_dict() for i in items]
        if len(items):
            return items[0].get('balance')
    except:
        raise exceptions.NotFound("Can't find account of current user")

def exist_product(request, project_id):
    enable_billing = getattr(settings, 'ENABLE_BILLING', False)
    if not enable_billing:
        return False

    # filter by project
    query = [{"field": "product.project_id",
              "op": "eq",
              "value": project_id,
              "type": "string",
              }]
    params1 = ["q.orderby=product.id",
              "q.sort=asc",
              "pagation.number=1",
              "pagation.count=1000"
              ]
    # exclude status: 'deleted', 'failed'
    # TODO(lzm): exclude the status 'failed'
    query.append({"field": "product.status",
              "op": "nq",
              "value": "-1",  # -1 means 'deleted'
              "type": "number"})
    product = product_list(request, query)
    # NOTE(lzm): because the billing server dose not return the
    # correct result, so we filter by status again.
    return len(product) > 0


def create_product(ptype, uuid_name='id', billing_by=None, quantity=None):
    # ptype: instance,image,volume,floatingip,snapshot
    # billing_by: flavor
    # quantity: bandwith, size
    enable_billing = getattr(settings, 'ENABLE_BILLING', False)

    def _create_product(request, result, create_time, *args, **kwargs):

        if uuid_name is None:
            resource_id = result
        else:
            if type(result) == dict:
                resource_id = result.get(uuid_name)
            else:
                resource_id = getattr(result, uuid_name)
        if quantity:
            resource_quantity = getattr(result, quantity)
        else:
            resource_quantity = 1

        # construct query
        query = [{"field": "price_item.ptype",
                 "op": "eq",
                 "value": ptype,
                 "type": "string",}]
        params = ["pagation.number=1",
                 "pagation.count=1",
                 "q.orderby=price_item.id",
                 "q.sort=asc"]

        if billing_by:
            rule = "{\\'%s\\':\\'%s\\'}" % (billing_by,
                                            getattr(result, billing_by).get('id'))
            rule_query = {"field": "price_item.rule",
                          "op": "eq",
                          "value": rule,
                          "type": ""}
            query.append(rule_query)

        fixid = get_active_pricefixing(request)
        if fixid == None:
            LOG.error("No active price fixing in usring")
        else:
            fixid_query = {"field": "price_item.price_fixing_id",
                           "op": "eq",
                           "value": int(fixid),
                           "type": "number"}
            query.append(fixid_query)
        priceitems = priceitem_list(request, query, params)
        priceitems = [p.to_dict() for p in priceitems]
        priceitem_id = priceitems[0].get('id')
        project_id = request.user.project_id
        domain_id = request.user.user_domain_id
        _account_id = get_account_id(request)

        product = {"resource_id": resource_id,
                   "priceitem_id": priceitem_id,
                   "quantity": resource_quantity,
                   "update_at": create_time,
                   "ptype": ptype,
                   "status": 0,
                   'project_id': project_id,
                   'domain_id': domain_id,
                   'account_id': _account_id,
                   'provider': 'openstack',
                   'payment_type': kwargs['payment_type'],
                   'unit': kwargs['unit']
                   }

        product_create(request, **product)

    def wrapper(func):
        def inner(request, *args, **kwargs):
            need_billing = enable_billing \
                and not policy.check((("identity", "cloud_admin"),), request) \
                and not keystone.is_dedicated_context(request) \
                and not request.user.user_domain_id == 'default' \
                and not keystone.is_public_region(request)
            # if we enable billing
            if need_billing:
                balance = get_balance(request)
                if balance <= 0:
                    LOG.error("Account Balance is less than 0")
                    raise exceptions.NotAuthenticated(
                        "Account Balance is less than 0")
                # make sure product time be earlier than resource create time
                create_time = datetime.datetime.utcnow()\
                    .strftime("%Y-%m-%d %H:%M:%S")
            # do request
            result = func(request, *args, **kwargs)
            # if we enable billing, create a product
            if need_billing:
                try:
                    if 'unit' in request.DATA:
                        kwargs['unit'] = request.DATA['unit']
                        if (kwargs['unit'] == 'H'):
                            kwargs['payment_type'] = 'post_paid'
                        elif (kwargs['unit'] == 'M'):
                            kwargs['payment_type'] = 'pre_paid'
                        else:
                            kwargs['payment_type'] = 'pre_paid'
                    elif 'metadata' in request.DATA:
                        if 'unit' in kwargs['metadata']:
                            kwargs['unit'] = kwargs['metadata']['unit']
                            if (kwargs['unit'] == 'H'):
                                kwargs['payment_type'] = 'post_paid'
                            elif (kwargs['unit'] == 'M'):
                                kwargs['payment_type'] = 'pre_paid'
                            else:
                                kwargs['payment_type'] = 'pre_paid'
                        else:
                            kwargs['unit'] = 'H'
                            kwargs['payment_type'] = 'post_paid'
                    elif 'loadbalancer' in request.DATA:
                        if 'unit' in request.DATA['loadbalancer']:
                            kwargs['unit'] = request.DATA['loadbalancer']['unit']
                            if (kwargs['unit'] == 'H'):
                                kwargs['payment_type'] = 'post_paid'
                            elif (kwargs['unit'] == 'M'):
                                kwargs['payment_type'] = 'pre_paid'
                            else:
                                kwargs['payment_type'] = 'pre_paid'
                        else:
                            kwargs['unit'] = 'H'
                            kwargs['payment_type'] = 'post_paid'
                    else:
                        kwargs['unit'] = 'H'
                        kwargs['payment_type'] = 'post_paid'

                    _create_product(request, result, create_time,
                                    *args, **kwargs)
                except Exception as e:
                    LOG.error(e)
                    # TODO(need to fix):
                    # raise exception to Servers post() in rest/nova.py
                    raise e
            return result

        return inner

    return wrapper

class BillingItem(base.APIResourceWrapper):
    _attrs = [
        'id',
        'charge_from',
        'charge_to',
        'charge_fee',
        'chargingitem_id',
        'product_id',
        'description',
    ]

class MockResource(base.APIResourceWrapper):
    _attrs = [
        'id',
        'resource_id',
        'timestamp',
        'meta',
    ]

class PriceFixing(base.APIResourceWrapper):
    _attrs = [
        'id',
        'description',
        'create_at',
        'start_at',
        'is_active',
        'is_applied',
        'price_zone_id',
    ]

class PriceItem(base.APIResourceWrapper):
    _attrs = [
        'id',
        'rule',
        'type',
        'ptype',
        'fee',
        'fee_hour',
        'fee_month',
        'fee_year',
        'unit',
        'price_fixing_id',
    ]

class PriceZone(base.APIResourceWrapper):
    _attrs = [
        'id',
        'name',
        'description',
        'ref_resource',
    ]

class Product(base.APIResourceWrapper):
    _attrs = [
        'id',
        'resource_id',
        'cost',
        'runtime',
        'fee',
        'unit',
        'quantity',
        'orginal_fee',
        'orginal_unit',
        'price_fixing_fee',
        'price_fixing_unit',
        'price_fixing_start',
        'price_fixing_priceitem_id',
        'provider',
        'ptype',
        'status',
        'event_at',
        'event_ms',
        'update_at',
        'create_at',
        'version',
        'priceitem_id',
        'account_id',
        'project_id',
        'domain_id',
        ]

def billingitems_list(request, query = None, param = None):
    billingItems = billingClient(request).billingitem.list(query, param).get('billingitems')
    return [BillingItem(billingItem) for billingItem in billingItems]

def billingitem_get(request, billingitem_id):
    billingitem = billingClient(request).billingitem.get(billingitem_id)
    return BillingItem(billingitem)

def billingitem_create(request, **kwarg):
    billingitem = billingClient(request).billingitem.create(**kwarg)
    return BillingItem(billingitem)

def billingitem_update(request, billingitem_id, **kwarg):
    billingitem = billingClient(request).billingitem.update(billingitem_id, **kwarg)
    return BillingItem(billingitem)

def billingitem_delete(request, billingitem_id):
    billingitem = billingClient(request).billingitem.delete(billingitem_id)
    return BillingItem(billingitem)

def mock_resource_list(request, query = None, param = None):
    mockresources = billingClient(request).mockresource.list(query, param).get('mockresources')
    return [MockResource(mockresource) for mockresource in mockresources]

def mock_resource_get(request, mock_id):
    mockresource = billingClient(request).mockresource.get(mock_id)
    return MockResource(mockresource)

def mock_resource_create(request, **kwarg):
    mockresource = billingClient(request).mockresource.create(**kwarg)
    return MockResource(mockresource)

def mock_resource_delete(request, mock_resource_id):
    mockresource = billingClient(request).mockresource.delete(mock_resource_id)
    return MockResource(mockresource)

def pricefixing_list(request, query = None, param = None):
    pricefixings = billingClient(request).pricefixing.list(query, param).get("pricefixings")
    return [PriceFixing(pricefixing) for pricefixing in pricefixings]

def pricefixing_get(request, pricefixing_id):
    pricefixing = billingClient(request).pricefixing.get(pricefixing_id)
    return PriceFixing(pricefixing)

@base.create_log_decorator(
    optype='Create', subject='Price Fixing', detail=None)
def pricefixing_create(request, pricefixing_id, **kwarg):
    pricefixing = billingClient(request).pricefixing.clone(pricefixing_id, **kwarg)
    return PriceFixing(pricefixing)

def pricefixing_update(request, pricefixing_id, **kwarg):
    pricefixing = billingClient(request).pricefixing.update(pricefixing_id, **kwarg)
    return PriceFixing(pricefixing)

def pricefixing_delete(request, pricefixing_id):
    pricefixing = billingClient(request).pricefixing.delete(pricefixing_id)
    return PriceFixing(pricefixing)

def priceitem_list(request, query = None, param = None):
    priceitems = billingClient(request).priceitem.list(query, param).get('priceitems')
    return [PriceItem(priceitem) for priceitem in priceitems]

def priceitem_get(request, priceitem_id):
    priceitem = billingClient(request).priceitem.get(priceitem_id)
    return PriceItem(priceitem)

def priceitem_create(request, **kwarg):
    priceitem = billingClient(request).priceitem.create(**kwarg)
    return PriceItem(priceitem)

def priceitem_update(request, priceitem_id, **kwarg):
    priceitem = billingClient(request).priceitem.update(priceitem_id, **kwarg)
    return PriceItem(priceitem)

def priceitem_delete(request, priceitem_id):
    priceitem = billingClient(request).priceitem.delete(priceitem_id)
    return PriceItem(priceitem)

def pricezone_list(request, query = None, param = None):
    pricezones = billingClient(request).pricezone.list(query, param).get("pricezones")
    return [PriceZone(pricezone) for pricezone in pricezones]

def pricezone_get(request, pricezone_id):
    pricezone = billingClient(request).pricezone.get(pricezone_id)
    return PriceZone(pricezone)

def pricezone_create(request, **kwarg):
    pricezone = billingClient(request).pricezone.create(**kwarg)
    return PriceZone(pricezone)

def pricezone_update(request, pricezone_id, **kwarg):
    pricezone = billingClient(request).pricezone.update(pricezone_id, **kwarg)
    return PriceZone(pricezone)

def pricezone_delete(request, pricezone_id):
    pricezone = billingClient(request).pricezone.delete(pricezone_id)
    return PriceZone(pricezone)

def product_list(request, query = None, param = None):
    products = billingClient(request).product.list(query, param).get('products')
    return [Product(product) for product in products]

def product_get(request, product_id):
    product = billingClient(request).product.get(product_id)
    return Product(product)

def product_create(request, **kwarg):
    product = billingClient(request).product.create(**kwarg)
    return Product(product)

def product_update(request, product_id, **kwarg):
    product = billingClient(request).product.update(product_id, **kwarg)
    return Product(product)

def product_delete(request, product_id):
    product = billingClient(request).product.delete(product_id)
    return Product(product)

def get_consumption(request, field, query = None, param = None):
    consum = None
    if field == 'cost':
        consum = billingClient(request).statistics.cost(query, param)
    elif field == 'current':
        consum = billingClient(request).statistics.current(query, param)
    return consum.get("result")

@memoized
def billingClient(request):
    endpoint = base.url_for(request, "billing")
    insecure = getattr(settings, 'OPENSTACK_SSL_NO_VERIFY', False)
    cacert = getattr(settings, 'OPENSTACK_SSL_CACERT', None)
    return billing_client.Client('2', endpoint,
                                 token = request.user.token.id,
                                 insecure = insecure,
                                 cacert = cacert)
