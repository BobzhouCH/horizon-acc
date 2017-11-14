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
from django.core.urlresolvers import reverse  # noqa
from django.utils.translation import ugettext_lazy as _  # noqa

from horizon import exceptions
from horizon import forms
from horizon import messages

from easystack_dashboard.api import chakra
from easystack_dashboard.api import billing
from easystack_dashboard.openstack.common import json2object

LOG = logging.getLogger(__name__)


class CreateAccountForm(forms.SelfHandlingForm):
    name = forms.CharField(label=_("Account Name"), required=True,)
    project = forms.ChoiceField(label=_("Project"), required=True,)

    def __init__(self, *args, **kwargs):
        projects = kwargs.get('initial', {}).get('projects')
        super(CreateAccountForm, self).__init__(*args, **kwargs)
        project_choices = [
            (project.id, project.name) for project in projects]
        if not project_choices:
            project_choices = [(None, _("No tenants available."))]
        self.fields['project'].choices = project_choices

    def handle(self, request, data):
        name = data.pop('name')
        project = data.pop('project')

        try:
            billing_client = chakra.AccountBilling()
            body = {"balance": 0, "ref_resource": project, "name": name}
            accounts, resultStatus = billing_client.create_account(body)
            if resultStatus != 200:
                messages.error(
                    request,
                    _('Unable to create the account.'))
            else:
                messages.success(
                    request,
                    _('Account has been created successfully.'))
        except Exception:
            messages.error(request, _('Unable to create the account.'))

        return True


class UpdateAccountForm(forms.SelfHandlingForm):
    id = forms.CharField(
        label=_("ID"),
        required=True,
        widget=forms.TextInput(attrs={'readonly': 'readonly'}))
    name = forms.CharField(label=_("Account Name"),
                           required=True,)
    project = forms.CharField(
        label=_("Project"),
        required=True,
        widget=forms.TextInput(attrs={'readonly': 'readonly'}))
    balance = forms.CharField(
        label=_("Balance"),
        required=True,
        widget=forms.TextInput(attrs={'readonly': 'readonly'}))

    def __init__(self, request, *args, **kwargs):
        super(UpdateAccountForm, self).__init__(request, *args, **kwargs)

        self.fields['id'].initial = \
            kwargs.get('initial', {}).get('id')
        self.fields['name'].initial = \
            kwargs.get('initial', {}).get('name')
        self.fields['balance'].initial = \
            kwargs.get('initial', {}).get('balance')
        self.fields['project'].initial = \
            kwargs.get('initial', {}).get('ref_resource')

    def handle(self, request, data):
        id = data.pop('id')
        name = data.pop('name')
        project = data.pop('project')
        balance = data.pop('balance')

        try:
            billing_client = chakra.AccountBilling()
            body = {"balance": float(balance),
                    "ref_resource": project,
                    "name": name}
            accounts, resultStatus = billing_client.update_accounts(body, id)
            if resultStatus != 500:
                messages.success(
                    request,
                    _('Account has been updated successfully.'))
            else:
                messages.error(
                    request,
                    _('Unable to update the account.'))
        except Exception:
            messages.error(request, _('Unable to update the account.'))

        return True


class EditPaymentForm(forms.SelfHandlingForm):
    id = forms.CharField(label=_("ID"),
                         required=True,
                         widget=forms.HiddenInput)
    payment = forms.CharField(label=_("Payment"), required=True,)

    def __init__(self, request, *args, **kwargs):
        super(EditPaymentForm, self).__init__(request, *args, **kwargs)
        self.fields['id'].initial = kwargs.get('initial', {}).get('id')

    def handle(self, request, data):
        payment = data.pop('payment')
        account_id = data.pop('id')

        try:
            billing_client = chakra.PaymentBilling()
            body = {"ptype": "admin",
                    "amount": float(payment),
                    "account_id": int(account_id)}
            accounts, resultStatus = billing_client.create_payment(body)
            if resultStatus != 500:
                messages.success(
                    request,
                    _('Payment has been added successfully.'))
            else:
                messages.error(
                    request,
                    _('Unable to add the payment.'))
        except Exception:
            messages.error(request, _('Unable to add the payment.'))

        return True


class CreatePriceItemForm(forms.SelfHandlingForm):
    price_id = forms.ChoiceField(label=_("Price"), required=True,)
    ptype = forms.ChoiceField(
        label=_("Type"),
        required=True,
        choices=[('combination', _('Combination')),
                 ('fix', _('Fix')),
                 ('multi', _('Multiple'))],
        widget=forms.Select(attrs={
            'class': 'switchable',
            'data-slug': 'ptype'}))
    # unit = forms.CharField(label=_("Unit"), required=True,)
    fee = forms.CharField(label=_("Fee"), required=True,)
    cpu = forms.CharField(
        label=_("CPU"),
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'switched',
            'data-switch-on': 'ptype',
            'data-ptype-combination': _('CPU')}))
    memory = forms.CharField(
        label=_("Memory"),
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'switched',
            'data-switch-on': 'ptype',
            'data-ptype-combination': _('Memory')}))
    '''os = forms.CharField(
        label=_("OS"),
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'switched',
            'data-switch-on': 'ptype',
            'data-ptype-combination': _('OS')}))'''

    def __init__(self, *args, **kwargs):
        super(CreatePriceItemForm, self).__init__(*args, **kwargs)
        account_id = kwargs.get('initial', {}).get('account_id')
        try:
            billing_client = billing.PriceBilling()
            billingitem_client = billing.PriceitemBilling()
            temp_prices = []

            search_param = {"q.field": "price.account_id",
                            "q.op": "eq",
                            "q.value": account_id,
                            "pagation.number": 1,
                            "pagation.count": 100,
                            "q.type": "string",
                            "q.orderby": "price.id",
                            "q.sort": "asc"}
            prices, resultStatus = billing_client.list_prices(search_param)
            prices = json.loads(prices)
            if prices['prices']:
                for i, price in enumerate(prices['prices']):
                    prices['prices'][i] = json2object.get_price(price)
            if resultStatus == 500:
                prices = []

            if prices['prices']:
                for id, price in enumerate(prices['prices']):
                    search_param = {"q.field": "price_item.price_id",
                                    "q.op": "eq",
                                    "q.value": price.id,
                                    "pagation.number": 1,
                                    "pagation.count": 100,
                                    "q.type": "number",
                                    "q.orderby": "price_item.id",
                                    "q.sort": "asc"}
                    priceitems, priceresultStatus = \
                        billingitem_client.list_priceitems(search_param)
                    if priceresultStatus == 200:
                        priceitems = json.loads(priceitems)
                        if not priceitems['priceitems']:
                            temp_prices.append(price)
                        else:
                            for j, priceitem in enumerate(
                                    priceitems['priceitems']):
                                if self.get_price_name(priceitem) == str(price.ptype) \
                                        and str(price.ptype) != 'instance':
                                    break
                                else:
                                    if j == len(priceitems['priceitems'])-1:
                                        temp_prices.append(price)

        except Exception:
            redirect = reverse('horizon:admin:billing:index')
            exceptions.handle(self.request,
                              _('Unable to retrieve account price.'),
                              redirect=redirect)
        self.fields['price_id'].choices = \
            [(price.id, _(price.ptype)) for price in temp_prices]

    def get_price_name(self, priceitem):
        billing_client = billing.PriceBilling()
        price, resultStatus = \
            billing_client.get_price(str(priceitem['price_id']))
        if resultStatus == 200:
            price = json.loads(price)
        else:
            price = ''
        return price['ptype']

    def handle(self, request, data):
        price_id = data.pop('price_id')
        # unit = data.pop('unit')
        ptype = data.pop('ptype')
        fee = data.pop('fee')
        cpu = data.pop('cpu')
        memory = data.pop('memory')
        # os = data.pop('os')

        try:
            billing_client = billing.PriceitemBilling()
            if cpu and memory:
                rule = {"cpu": int(cpu),
                        "mem": int(memory),
                        "os": 'os'}
                body = {"rule": str(rule),
                        "fee": float(fee),
                        "unit": 'Hour',
                        "ptype": str(ptype),
                        "price_id": int(price_id)}
            else:
                body = {"rule": "",
                        "fee": float(fee),
                        "unit": 'Hour',
                        "ptype": str(ptype),
                        "price_id": int(price_id)}

            priceitem, resultStatus = billing_client.create_priceitem(body)
            if resultStatus != 500:
                messages.success(
                    request,
                    _('Price item has been created successfully.'))
            else:
                messages.error(
                    request,
                    _('Unable to create the price item.'))
        except Exception:
            messages.error(request, _('Unable to create the price item.'))

        return True
