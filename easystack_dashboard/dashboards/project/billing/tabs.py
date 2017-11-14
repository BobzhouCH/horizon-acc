# vim: tabstop=4 shiftwidth=4 softtabstop=4

# Copyright 2013 Kylin, Inc.
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
from django.utils.translation import ugettext_lazy as _  # noqa

from horizon import tabs

from easystack_dashboard.api import billing
from easystack_dashboard.openstack.common import json2object
from easystack_dashboard.dashboards.project.billing import tables


class AccountTab(tabs.Tab):
    name = _("Account Detail")
    slug = "account"
    template_name = "project/billing/account_detail.html"
    preload = False

    def get_context_data(self, request):
        billing_account_tmp = ''
        account_client = billing.AccountBilling()
        search_param = {"q.field": "account.ref_resource",
                        "q.op": "eq",
                        "q.value": self.request.user.tenant_id,
                        "pagation.number": 1,
                        "pagation.count": 100,
                        "q.type": "string",
                        "q.orderby": "account.id",
                        "q.sort": "asc"}
        accounts, resultStatus = account_client.list_accounts(search_param)
        if resultStatus == 200:
            accounts = json.loads(accounts)
            for account in accounts['accounts']:
                if account['ref_resource'] == self.request.user.tenant_id:
                    billing_account_tmp = account
            if billing_account_tmp:
                account_id = billing_account_tmp['id']
                account, resultStatus = \
                    account_client.get_account(str(account_id))
                account = json.loads(account)
            else:
                account = ''
        else:
            account = ''

        return {"account": account}


class PriceItemTab(tabs.TableTab):
    table_classes = (tables.PriceItemTable,)
    name = _("Price")
    slug = "priceitem"
    template_name = ("easystack_dashboard/common/_es_detail_table.html")

    def get_priceitem_data(self):
        priceitems = []
        priceitem_tmp, billing_account_tmp = \
            billing.get_all_billing_items(self.request)
        for item in priceitem_tmp:
            priceitems.append(json2object.get_priceItem(item))
        return priceitems


class BillingProductTab(tabs.TableTab):
    table_classes = (tables.ProductTable,)
    name = _("Billing Product")
    slug = "billingproduct"
    template_name = ("easystack_dashboard/common/_es_detail_table.html")

    def get_billingproduct_data(self):
        billingproducts = []
        billing_account_tmp = []
        billing_items_tmp = []
        account_client = billing.AccountBilling()
        search_param = {"q.field": "account.ref_resource",
                        "q.op": "eq",
                        "q.value": self.request.user.tenant_id,
                        "pagation.number": 1,
                        "pagation.count": 100,
                        "q.type": "string",
                        "q.orderby": "account.id",
                        "q.sort": "asc"}
        accounts, resultStatus = account_client.list_accounts(search_param)
        if resultStatus == 200:
            accounts = json.loads(accounts)
            for account in accounts['accounts']:
                if account['ref_resource'] == self.request.user.tenant_id:
                    billing_account_tmp = account
        if billing_account_tmp:
            account_id = billing_account_tmp['id']
            search_param = {"q.field": "product.account_id",
                            "q.op": "eq",
                            "q.value": str(account_id),
                            "pagation.number": 1,
                            "pagation.count": 100,
                            "q.type": "string",
                            "q.orderby": "product.id",
                            "q.sort": "asc"}
            product_client = billing.ProductBilling()
            products, resultStatus = product_client.list_products(search_param)
            products = json.loads(products)
            for p in products['products']:
                if p['status'] != 0:
                    billingproducts.append(json2object.get_product(p))
        else:
            billingproducts = []

        return billingproducts


class DefaultsTabs(tabs.TabGroup):
    slug = "Billing"
    tabs = (AccountTab, PriceItemTab, BillingProductTab)
    sticky = True
