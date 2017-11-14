# Copyright 2012 OpenStack Foundation
# Copyright 2010 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# Copyright 2011 - 2012 Justin Santa Barbara
# All Rights Reserved.
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.
"""API over the billing service."""
import json
from datetime import datetime
from horizon import exceptions

from django.views import generic
from django import http
from django.conf import settings

from easystack_dashboard import api
from easystack_dashboard.api import billing
from easystack_dashboard.api.rest import urls
from easystack_dashboard.api.rest import utils as rest_utils
from easystack_dashboard.api.rest import ceilometer
from easystack_dashboard.api.billing import get_account_id
from easystack_dashboard.api import keystone

status_dic = {-1: 'deleted',
              0: 'disable',
              1: 'active',
              2: 'suspend',
              3: 'stop'}

@urls.register
class PriceDetails(generic.View):
    url_regex = r'billing/pricedetails/(?P<detail_id>.+|default|)$'

    @rest_utils.ajax(data_required=True)
    def put(self, request, detail_id):
        body = request.DATA
        id = body.get('id')
        priceitem = billing.priceitem_update(request, id, **body).to_dict()
        return priceitem


@urls.register
class PriceItems(generic.View):
    url_regex = r'billing/priceitems/(?P<ptype>.+|default|)$'

    @rest_utils.ajax()
    @rest_utils.patch_items_by_func(rest_utils.ensure_billing_rule_dscrs)
    @rest_utils.patch_items_by_func(rest_utils.ensure_billing_flavors)
    def get(self, request, ptype):
        fix_id = None
        items = billing.pricefixing_list(request)
        items = [i.to_dict() for i in items]
        for item in items:
            if item.get('is_active'):
                fix_id = item.get('id')
                break
        query = [{
                  "field": "price_item.ptype",
                  "op": "eq",
                  "value": ptype,
                  "type": "string",
                 }]
        params = ["pagation.number=1",
                 "pagation.count=1000",
                 "q.orderby=price_item.id",
                 "q.sort=asc"]
        if fix_id == None:
            return rest_utils.AjaxError(500, "No active price fixing")
        query.append({
                      "field": "price_item.price_fixing_id",
                      "op": "eq",
                      "value": int(fix_id),
                      "type": "number"
                      })
        priceitems = billing.priceitem_list(request, query, params)
        priceitems = [p.to_dict() for p in priceitems]
        return {'items': priceitems}

    @rest_utils.ajax(data_required=True)
    def put(self, request, ptype):
        # we do not need this api now.
        # This method has implemented in price detail class.
        pass

    @rest_utils.ajax(data_required=True)
    def post(self, request, ptype):
        body = request.DATA
        body.update({"price_fixing": {"id": body.get("price_fixing_id")}})
        body.pop("price_fixing_id")
        # body.update({"rule": "{}"})
        # body.update({"type": "test"})
        priceitem = billing.priceitem_create(request, **body).to_dict()
        return priceitem


@urls.register
class PriceItem(generic.View):
    url_regex = r'billing/priceitem/(?P<priceitem_id>.+)/$'

    @rest_utils.ajax()
    def delete(self, request, priceitem_id):
        content = billing.priceitem_delete(request, priceitem_id)


@urls.register
class CurrentPrice(generic.View):
    url_regex = r'billing/currentprice/(?P<query>.+|)$'

    @rest_utils.ajax()
    @rest_utils.patch_items_by_func(rest_utils.ensure_billing_rule_dscrs)
    @rest_utils.patch_items_by_func(rest_utils.ensure_billing_flavors)
    def get(self, request, query):
        items = billing.get_current_price(query, request)
        if items:
            return {'items': items}
        return {'items': []}


def ensure_price_item_state(item):
    if item.get('is_active'):
        item['state'] = 'USING'
    else:
        t = item.get('start_at')
        if t == None:
            item['state'] = 'NO_START_TIME'
        elif t == -1:
            item['state'] = "STARTING"
        elif datetime.strptime(t, '%Y-%m-%d %H:%M:%S')\
                < datetime.utcnow():
            item['state'] = 'EXPIRED'
        else:
            s = item.get('is_applied')
            if s:
                item['state'] = 'TOUSE'
            else:
                item['state'] = 'PLAN'


@urls.register
class PriceFix(generic.View):
    url_regex = r'billing/pricefix/(?P<fix_id>.+|default)/$'

    @rest_utils.ajax()
    @rest_utils.patch_items_by_func(rest_utils.ensure_billing_rule_dscrs)
    @rest_utils.patch_items_by_func(rest_utils.ensure_billing_flavors)
    def get(self, request, fix_id):
        fix_id = fix_id.replace("/", "")
        query = [{"field": "price_item.price_fixing_id",
                 "op": "eq",
                 "value": int(fix_id),
                 "type": "number",}]
        params = ["pagation.number=1",
                 "pagation.count=1000",
                 "q.orderby=price_item.id",
                 "q.sort=asc"]
        priceitem = billing.priceitem_list(request, query, params)
        priceitem = [p.to_dict() for p in priceitem]
        return {"items": priceitem}

    @rest_utils.ajax(data_required=True)
    def put(self, request, fix_id):
        body = request.DATA
        if body.has_key('state'):
            body.pop('state')
        if fix_id == "":
            fix_id = body.get("id")
        _start_at = body.get("start_at")
        if _start_at != -1:
            if datetime.strptime(_start_at, '%Y-%m-%d %H:%M:%S')\
                    < datetime.utcnow():
                return http.HttpResponse(content="The start_at time should be greater than now", status=400)
        pricefix = billing.pricefixing_update(request, fix_id, **body).to_dict()
        ensure_price_item_state(pricefix)
        return pricefix

    @rest_utils.ajax(data_required=True)
    def post(self, request, fix_id=None):
        body = request.DATA
        fix_id = body.get("base_id")
        # fix_detail = billing.pricefixing_get(request, fix_id).to_dict()
        # if not fix_detail.get('id'):
        #     zone_id = 1
        # else:
        #     zone_id = fix_detail.get('id')

        zone_id = 1
        body.update({"price_zone": {"id": zone_id}})
        pricefix = billing.pricefixing_create(request, fix_id, **body).to_dict()
        ensure_price_item_state(pricefix)
        return pricefix


@urls.register
class PriceFixing(generic.View):
    url_regex = r'billing/pricefixing/(?P<fix_id>.+|default)/$'

    @rest_utils.ajax()
    def get(self, request, fix_id):
        fix_id = fix_id.replace("/", "")
        try:
            content = billing.pricefixing_get(request, fix_id).to_dict()
            return {"items": content}
        except:
            return None

    @rest_utils.ajax()
    def delete(self, request, fix_id):
        fix_id = fix_id.replace("/", "")
        content = billing.pricefixing_delete(request, fix_id)


@urls.register
class PriceFixHistory(generic.View):
    url_regex = r'billing/pricefixhistory/$'

    @rest_utils.ajax()
    def get(self, request):
        content = billing.pricefixing_list(request)
        items = [i.to_dict() for i in content]
        for item in items:
            ensure_price_item_state(item)
        return {'items': items}


@urls.register
class Product(generic.View):
    url_regex = r'billing/product/(?P<query>.+|)$'

    @rest_utils.ajax()
    def get(self, request, query):
        is_domain_admin = keystone.is_domain_admin(request)
        if not is_domain_admin[0]:
            return {"items": ""}
        if is_domain_admin[1]:
            query_field = "product.account_id"
            query_value = get_account_id(request)
            query_type = "number"
            if query_value == None:
                return {"items": ""}
        else:
            query_field = "product.project_id"
            query_value = request.user.project_id
            query_type = "string"
        if query:
            query_field = query.split('=')[0]
            query_value = query.split('=')[1]
            query_type = 'string'
        query = [{"field": query_field,
                 "op": "eq",
                 "value": query_value,
                 "type": query_type,}]
        params = ["pagation.number=1",
                 "pagation.count=1000",
                 "q.orderby=product.id",
                 "q.sort=asc"]
        products = billing.product_list(request, query, params)
        items = [p.to_dict() for p in products]
        try:
            _project_id_name = {}
            for item in items:
                item['status'] = status_dic.get(item['status'])
                resource = ceilometer.get_resource_info(
                    request, item.get('resource_id'))
                if resource.get('resource_name'):
                    item.update(
                        {'resource_name': resource.get('resource_name')})
                else:
                    item.update({'resource_name': item.get('resource_id')})
                p_name = _project_id_name.get(item.get('project_id'))
                if p_name:
                    item.update({'project_name': p_name})
                else:
                    try:
                        project = keystone.tenant_get(
                            request, item.get('project_id'), admin=request.user.is_superuser).to_dict()
                    except Exception:
                        continue
                    if project.get('name'):
                        item.update({'project_name': project.get('name')})
                        _project_id_name.update(
                            {item.get('project_id'): project.get('name')})
                    else:
                        item.update({'project_name': item.get('project_id')})
            return {"items": items}
        except:
            pass

    @rest_utils.ajax(data_required=True)
    def post(self, request, query):
        data = request.DATA
        project_id = request.user.project_id
        domain_id = request.user.user_domain_id
        _account_id = get_account_id(request)
        if _account_id == None:
            raise exceptions.NotFound(
                "Your User has no billing account")
        data.update({'project_id': project_id,
                     'domain_id': domain_id,
                     'account_id': _account_id,
                     'provider': 'openstack'})
        product = billing.product_create(request, data).to_dict()
        return product


@urls.register
class BillingItem(generic.View):
    url_regex = r'billing/billingitem/(?P<product_id>.+|)$'

    @rest_utils.ajax()
    def get(self, request, product_id):
        product_id = int(product_id.replace("/", ""))
        query = [{"field": "billing_item.product_id",
                 "op": "eq",
                 "value": product_id,
                 "type": "number",}]
        params = ["pagation.number=1",
                 "pagation.count=-1",
                 "q.orderby=billing_item.id",
                 "q.sort=asc"]
        billingitems = billing.billingitems_list(request, query, params)
        items = [item.to_dict() for item in billingitems]
        return {"items": items}


@urls.register
class Statistics(generic.View):
    url_regex = r'billing/statistic/(?P<field>.+|)/(?P<id>.+|)$'

    @rest_utils.ajax()
    def get(self, request, field, id):
        if field not in ("cost", "current"):
            return http.HttpResponse(400, "Bad Request!")
        if id not in('', 'All'):
            query_field = "product.project_id"
            query_value = id
            query_type = "string"
        else:
            is_domain_admin = keystone.is_domain_admin(request)
            if not is_domain_admin[0]:
                return {"items": ""}
            if is_domain_admin[1]:
                query_field = "product.account_id"
                query_value = get_account_id(request)
                query_type = "number"
                if query_value == None:
                    return {"items": ""}
            else:
                query_field = "product.project_id"
                query_value = request.user.project_id
                query_type = "string"
        query = [{"field": query_field,
                 "op": "eq",
                 "value": query_value,
                 "type": query_type, }]
        content = billing.get_consumption(request, field, query)
        content = [c.to_dict() for c in content]
        return {"items": content}


@urls.register
class EnableBilling(generic.View):
    url_regex = r'billing/enablebilling/$'

    @rest_utils.ajax()
    def get(self, request):
        enable_billing = False
        if not keystone.is_public_region(request):
            if not keystone.is_dedicated_context(request):
                enable_billing = getattr(settings, 'ENABLE_BILLING', True)
        return rest_utils.JSONResponse(enable_billing, 200)


@urls.register
class RechargeWays(generic.View):
    url_regex = r'billing/recharge/$'

    @rest_utils.ajax()
    def get(self, request):
        invcode_enable = getattr(settings, 'INVCODE_ENABLE', True)
        invcode_recharge = getattr(settings, 'INVCODE_RECHARGE', False)
        items = {"alipay": getattr(settings, 'ALIPAY_RECHARGE', False),
                 "invcode": invcode_enable and invcode_recharge,
                 "yeepay": getattr(settings, 'YEEPAY_RECHARGE', False)}
        return {"items": items}


@urls.register
class ActiveFixing(generic.View):
    url_regex = r'billing/activefixing/$'

    @rest_utils.ajax()
    def get(self, request):
        if not keystone.is_public_region(request):
            fixing = billing.get_active_pricefixing(request)
            if fixing is None:
                return rest_utils.JSONResponse(False, 200)
        return rest_utils.JSONResponse(True, 200)


@urls.register
class Balance(generic.View):
    url_regex = r'billing/balance/$'

    @rest_utils.ajax()
    def get(self, request):
        balance = billing.get_balance(request)
        return rest_utils.JSONResponse(balance, 200)

@urls.register
class AdminProduct(generic.View):
    url_regex = r'billing/admin/product/(?P<domain_id>.+|)$'

    def _get_resource_info(self, request, resourceid):
        resource = api.ceilometer.resource_get(request, resourceid)
        name = None
        res_type = None
        dic = {}
        if resource is not None:
            if hasattr(resource, "resource_name"):
                name = resource.resource_name
            if hasattr(resource, "type"):
                res_type = resource.type
            else:
                if resource.metadata.has_key('event_type'):
                    res_type = resource.metadata.get('event_type')
                    res_type = res_type.split('.')[0]
                if resource.metadata.has_key('floating_ip_address'):
                    res_type = 'floatingip'
            mac = resource.metadata.get('mac')
            if mac is not None and not name:
                try:
                    name = api.ceilometer.resource_get(
                        request, resource.metadata.get('instance_id')).resource_name
                except Exception as e:
                    pass
            dic.update({'resource_name': name})
            dic.update({'resource_id': resourceid})
            dic.update({'resource_type': res_type})
        return dic

    @rest_utils.ajax()
    def get(self, request, domain_id):
        if not keystone.is_default_domain_admin(request)[1]:
            raise exceptions.NotAuthorized

        if domain_id:
            query_field = "product.account_id"
            query_value = get_account_id(request, domain_id = domain_id)
            query_type = "number"
            if query_value == None:
                return {"items": ""}
            query = [{"field": query_field,
                     "op": "eq",
                     "value": query_value,
                     "type": query_type,}]
        else:
            query = None

        params = ["pagation.number=1",
                 "q.orderby=product.id",
                 "q.sort=asc"]
        products = billing.product_list(request, query, params)
        items = [p.to_dict() for p in products]
        tenant_dict = {}

        tenants, has_more = api.keystone.tenant_list(request, domain=domain_id)
        for tenant in tenants:
            tenant_dict[tenant.id] = tenant.to_dict()

        try:
            _project_id_name = {}
            for item in items:
                item['status'] = status_dic.get(item['status'])
                resource = self._get_resource_info(
                    request, item.get('resource_id'))

                if resource.get('resource_name'):
                    item.update(
                        {'resource_name': resource.get('resource_name')})
                else:
                    item.update({'resource_name': item.get('resource_id')})
                p_name = _project_id_name.get(item.get('project_id'))
                if p_name:
                    item.update({'project_name': p_name})
                else:
                    project = tenant_dict.get(item.get('project_id'))
                    if not project:
                        continue
                    if project.get('name'):
                        item.update({'project_name': project.get('name')})
                        _project_id_name.update(
                            {item.get('project_id'): project.get('name')})
                    else:
                        item.update({'project_name': item.get('project_id')})
            return {"items": items}
        except:
            pass
