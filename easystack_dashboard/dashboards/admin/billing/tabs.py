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

from django.utils.translation import ugettext_lazy as _  # noqa

from horizon import exceptions
from horizon import tabs

from easystack_dashboard.api import billing
from easystack_dashboard.openstack.common import json2object
from easystack_dashboard.dashboards.admin.billing.accounts \
    import tables as account_tables
from easystack_dashboard.dashboards.admin.billing.prices \
    import tables as price_tables


class AccountTab(tabs.TableTab):
    table_classes = (account_tables.AccountsTable,)
    name = _("Account")
    slug = "account"
    template_name = ("easystack_dashboard/common/_es_detail_table.html")

    def get_account_data(self):
        accounts = []
        try:
            billing_client = billing.AccountBilling()
            accounts, resultStatus = billing_client.get_accounts()
            if resultStatus == 200:
                accounts = json.loads(accounts)
                for i, account in enumerate(accounts['accounts']):
                    accounts['accounts'][i] = json2object.get_account(account)
            if resultStatus == 500:
                return []
        except Exception:
            exceptions.handle(self.request,
                              _('Unable to retrieve user list.'))
        if resultStatus == 200:
            return accounts.get('accounts')
        else:
            return ''


class PriceTab(tabs.TableTab):
    table_classes = (price_tables.PricesTable,)
    name = _("Default Price")
    slug = "price"
    template_name = ("easystack_dashboard/common/_es_detail_table.html")

    def get_prices_data(self):
        prices = []
        prices.append(json2object.get_price({
            "id": 1,
            "ptype": "instance",
            "name": "instance pricing template"}))
        prices.append(json2object.get_price({
            "id": 2,
            "ptype": "volume",
            "name": "volume pricing template"}))
        prices.append(json2object.get_price({
            "id": 3,
            "ptype": "floating",
            "name": "floating pricing template"}))
        prices.append(json2object.get_price({
            "id": 4,
            "ptype": "image",
            "name": "image pricing template"}))
        prices.append(json2object.get_price({
            "id": 5,
            "ptype": "snapshot",
            "name": "snapshot pricing template"}))

        return prices


class BillingTabs(tabs.TabGroup):
    slug = "Billing"
    tabs = (AccountTab, PriceTab)
    sticky = True
