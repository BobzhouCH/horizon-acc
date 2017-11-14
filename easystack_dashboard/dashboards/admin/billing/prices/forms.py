# vim: tabstop=4 shiftwidth=4 softtabstop=4

# Copyright 2012 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
#
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

import logging
import json

from django.utils.translation import ugettext_lazy as _  # noqa

from horizon import forms
from horizon import messages

from easystack_dashboard.api import billing

LOG = logging.getLogger(__name__)


class CreatePriceForm(forms.SelfHandlingForm):
    name = forms.CharField(label=_("Name"),
                           required=False,
                           widget=forms.HiddenInput)
    ptype = forms.CharField(label=_("Price type"),
                            required=False,  widget=forms.HiddenInput)
    account = forms.ChoiceField(label=_("Account"), )

    def __init__(self, *args, **kwargs):
        accounts = kwargs.get('initial', {}).get('accounts')
        price = kwargs.get('initial', {}).get('price')
        super(CreatePriceForm, self).__init__(*args, **kwargs)
        prices_client = billing.PriceBilling()
        temp_accounts = []
        if accounts:
            for id, account in enumerate(accounts):
                search_param = {"q.field": "price.account_id",
                                "q.op": "eq",
                                "q.value": account.id,
                                "pagation.number": 1,
                                "pagation.count": 100,
                                "q.type": "number",
                                "q.orderby": "price.id",
                                "q.sort": "asc"}
                prices, resultStatus = prices_client.list_prices(search_param)
                if resultStatus == 200:
                    prices = json.loads(prices)
                    if not prices['prices']:
                        temp_accounts.append(account)
                    else:
                        for j, p in enumerate(prices['prices']):
                            if str(p['ptype']) == price.get('ptype'):
                                break
                            else:
                                if j == len(prices['prices'])-1:
                                    temp_accounts.append(account)

        account_choices = [
            (account.id, account.name) for account in temp_accounts]
        if not account_choices:
            account_choices = [(None, _("No available accounts."))]
        self.fields['account'].choices = account_choices
        self.fields['name'].initial = price.get('name')
        self.fields['ptype'].initial = price.get('ptype')

    def handle(self, request, data):
        account_id = data.pop('account')
        name = data.pop('name')
        ptype = data.pop('ptype')
        try:
            billing_client = billing.PriceBilling()
            body = {"ptype": ptype, "name": name, "account_id": account_id}
            prices, resultStatus = billing_client.create_price(body)
            if resultStatus == 200:
                messages.success(
                    request,
                    _('Price has been added successfully.'))
            else:
                messages.error(
                    request,
                    _('Unable to add the price.'))
        except Exception:
            messages.error(request, _('Unable to add the price.'))

        return True
