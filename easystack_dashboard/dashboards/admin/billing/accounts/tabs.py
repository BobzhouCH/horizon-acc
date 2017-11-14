# vim: tabstop=4 shiftwidth=4 softtabstop=4

# Copyright 2012 Nebula, Inc.
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

import json

from django.core.urlresolvers import reverse  # noqa
from django.utils.translation import ugettext_lazy as _  # noqa

from horizon import exceptions
from horizon import tabs

from easystack_dashboard import api

from easystack_dashboard.api import billing
from easystack_dashboard.openstack.common import json2object
from easystack_dashboard.dashboards.admin.billing.accounts import \
    tables as account_tables


class PriceTab(tabs.TableTab):
    table_classes = (account_tables.PricesTable,)
    name = _("Price Template")
    slug = "price"
    template_name = ("easystack_dashboard/common/_es_detail_table.html")

    def get_price_data(self):
        account_id = self.tab_group.kwargs['account_id']
        try:
            billing_client = billing.PriceDetailBilling()
            search_param = {"q.field": "price.account_id",
                            "q.op": "eq",
                            "q.value": int(account_id),
                            "pagation.number": 1,
                            "pagation.count": 100,
                            "q.type": "number",
                            "q.orderby": "price.id",
                            "q.sort": "asc"}
            prices, resultStatus = billing_client.list_prices(search_param)
            prices = json.loads(prices)
            if prices['prices']:
                for i, price in enumerate(prices['prices']):
                    prices['prices'][i] = json2object.get_price(price)
            if resultStatus == 500:
                return []
        except Exception:
            redirect = reverse('horizon:admin:billing:index')
            exceptions.handle(self.request,
                              _('Unable to retrieve account price.'),
                              redirect=redirect)
        return prices['prices']


class PriceItemTab(tabs.TableTab):
    table_classes = (account_tables.PricesItemTable,)
    name = _("Price Item")
    slug = "priceitem"
    template_name = ("easystack_dashboard/common/_es_detail_table.html")

    def get_priceitem_data(self):
        account_id = self.tab_group.kwargs['account_id']
        try:
            billing_client = billing.PriceDetailBilling()
            search_param = {"q.field": "price.account_id",
                            "q.op": "eq",
                            "q.value": int(account_id),
                            "pagation.number": 1,
                            "pagation.count": 100,
                            "q.type": "number",
                            "q.orderby": "price.id",
                            "q.sort": "asc"}
            prices, resultStatus = billing_client.list_prices(search_param)
            prices = json.loads(prices)
            if prices['prices']:
                for i, price in enumerate(prices['prices']):
                    prices['prices'][i] = json2object.get_price(price)
            if resultStatus == 500:
                return []
        except Exception:
            redirect = reverse('horizon:admin:billing:index')
            exceptions.handle(self.request,
                              _('Unable to retrieve account price.'),
                              redirect=redirect)

        billing_client = billing.PriceitemBilling()
        items = []
        for p in prices['prices']:
            search_param = {"q.field": "price_item.price_id",
                            "q.op": "eq",
                            "q.value": p.id,
                            "pagation.number": 1,
                            "pagation.count": 100,
                            "q.type": "number",
                            "q.orderby": "price_item.id",
                            "q.sort": "asc"}
            priceitems, resultStatus = \
                billing_client.list_priceitems(search_param)
            priceitems = json.loads(priceitems)

            if priceitems['priceitems']:
                for i, priceitem in enumerate(priceitems['priceitems']):
                    priceitems['priceitems'][i] = \
                        json2object.get_priceItem(priceitem)
            items += priceitems['priceitems']

        return items


class AccountDetailTabs(tabs.TabGroup):
    slug = "account_details"
    tabs = (PriceTab, PriceItemTab)
    template_name = "easystack_dashboard/common/_es_tab_group.html"
