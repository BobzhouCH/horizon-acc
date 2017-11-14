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

import json

from django.core.urlresolvers import reverse  # noqa
from django.core.urlresolvers import reverse_lazy  # noqa
from django.utils.translation import ugettext_lazy as _  # noqa

from horizon import exceptions
from horizon import forms
from horizon import tables
from horizon import tabs

from easystack_dashboard import api

from easystack_dashboard.api import chakra
from easystack_dashboard.openstack.common import json2object
from easystack_dashboard.dashboards.admin.billing.accounts \
    import forms as account_forms
from easystack_dashboard.dashboards.admin.billing.accounts \
    import tables as account_tables
from easystack_dashboard.dashboards.admin.billing.accounts \
    import tabs as account_tabs


class DetailView(tabs.TabbedTableView):
    tab_group_class = account_tabs.AccountDetailTabs
    template_name = 'admin/billing/accounts/detail.html'


class IndexView(tables.DataTableView):
    table_class = account_tables.AccountsTable
    template_name = 'admin/billing/index.html'

    def get_data(self):
        accounts = []
        try:
            billing_client = chakra.AccountBilling()
            accounts, resultStatus = billing_client.get_accounts()
            if accounts:
                accounts = json.loads(accounts)
                for i, account in enumerate(accounts['accounts']):
                    accounts['accounts'][i] = json2object.get_account(account)
            if resultStatus == 500:
                return []
        except Exception:
            exceptions.handle(self.request,
                              _('Unable to retrieve user list.'))
        if accounts:
            return accounts.get('accounts')
        else:
            return accounts


class UpdateView(forms.ModalFormView):
    form_class = account_forms.UpdateAccountForm
    template_name = 'admin/billing/accounts/update.html'
    success_url = reverse_lazy('horizon:admin:billing:index')

    def get_object(self):
        if not hasattr(self, "_object"):
            try:
                billing_client = chakra.AccountBilling()
                self._object, resultStatus = \
                    billing_client.get_account(self.kwargs['account_id'])
                self._object = json.loads(self._object)
                if resultStatus == 500:
                    return []
            except Exception:
                redirect = reverse("horizon:admin:billing:index")
                exceptions.handle(self.request,
                                  _('Unable to update user.'),
                                  redirect=redirect)
        return self._object

    def get_context_data(self, **kwargs):
        context = super(UpdateView, self).get_context_data(**kwargs)
        context['account'] = self.get_object()
        return context

    def get_initial(self):
        account = self.get_object()

        return {'id': account.get("id"),
                'balance':  account.get("balance"),
                'ref_resource':  account.get("ref_resource"),
                'name':  account.get("name")}


class CreateView(forms.ModalFormView):
    form_class = account_forms.CreateAccountForm
    template_name = 'admin/billing/accounts/create.html'
    success_url = reverse_lazy('horizon:admin:billing:index')

    def get_initial(self):
        projects, more = api.keystone.tenant_list(self.request)
        billing_client = chakra.AccountBilling()
        accounts, resultStatus = billing_client.get_accounts()
        if resultStatus == 200:
            accounts = json.loads(accounts)
            for account in accounts['accounts']:
                for id, project in enumerate(projects):
                    if project.id == account['ref_resource'] \
                            or project.name == 'service':
                        projects.pop(id)
            return {'projects': projects}
        else:
            return {'projects': ''}


class CreatePriceItemView(forms.ModalFormView):
    form_class = account_forms.CreatePriceItemForm
    template_name = 'admin/billing/accounts/create_priceitem.html'

    def get_context_data(self, **kwargs):
        context = super(CreatePriceItemView, self).get_context_data(**kwargs)
        context["account_id"] = self.kwargs['account_id']
        return context

    def get_initial(self):
        return {'account_id': self.kwargs['account_id']}

    def get_success_url(self):
        account_id = self.kwargs['account_id']
        return reverse("horizon:admin:billing:accounts:detail",
                       args=[account_id])


class UpdatePaymentView(forms.ModalFormView):
    form_class = account_forms.EditPaymentForm
    template_name = 'admin/billing/accounts/update_payment.html'
    success_url = reverse_lazy('horizon:admin:billing:index')

    def get_object(self):
        if not hasattr(self, "_object"):
            try:
                billing_client = chakra.AccountBilling()
                self._object, resultStatus = \
                    billing_client.get_account(self.kwargs['account_id'])
                self._object = json.loads(self._object)
                if resultStatus == 500:
                    return []
            except Exception:
                redirect = reverse("horizon:admin:billing:index")
                exceptions.handle(self.request,
                                  _('Unable to update user.'),
                                  redirect=redirect)
        return self._object

    def get_context_data(self, **kwargs):
        context = super(UpdatePaymentView, self).get_context_data(**kwargs)
        context['account'] = self.get_object()
        return context

    def get_initial(self):
        account = self.get_object()
        return {'id': account.get("id")}
