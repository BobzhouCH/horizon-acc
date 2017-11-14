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

from easystack_dashboard.api import billing
from easystack_dashboard.openstack.common import json2object
from easystack_dashboard.dashboards.admin.billing.prices \
    import forms as price_forms


class CreateView(forms.ModalFormView):
    form_class = price_forms.CreatePriceForm
    template_name = 'admin/billing/prices/create.html'
    success_url = reverse_lazy('horizon:admin:billing:index')

    def get_object(self):
        if not hasattr(self, "_object"):
            try:
                prices = []
                prices.append({"id": 1,
                               "ptype": "instance",
                               "name": "instance pricing template"})
                prices.append({"id": 2,
                               "ptype": "volume",
                               "name": "volume pricing template"})
                prices.append({"id": 3,
                               "ptype": "floatingIP",
                               "name": "floatingIP pricing template"})
                prices.append({"id": 4,
                               "ptype": "image",
                               "name": "image pricing template"})
                prices.append({"id": 5,
                               "ptype": "snapshot",
                               "name": "snapshot pricing template"})
                for p in prices:
                    if p['id'] == int(self.kwargs['price_id']):
                        self._object = p
            except Exception:
                redirect = reverse("horizon:admin:billing:index")
                exceptions.handle(self.request,
                                  _('Unable to update user.'),
                                  redirect=redirect)
        return self._object

    def get_context_data(self, **kwargs):
        context = super(CreateView, self).get_context_data(**kwargs)
        context['price'] = self.get_object()
        return context

    def get_initial(self):
        accounts = []
        price = []
        price = self.get_object()
        try:
            billing_client = billing.AccountBilling()
            accounts, resultStatus = billing_client.get_accounts()
            if resultStatus == 200:
                accounts = json.loads(accounts)
                for i, account in enumerate(accounts['accounts']):
                    accounts['accounts'][i] = json2object.get_account(account)
            if resultStatus != 200:
                return {"accounts": '', "price": price}
        except Exception:
            exceptions.handle(self.request,
                              _('Unable to retrieve user list.'))
        if resultStatus == 200:
            return {"accounts": accounts.get('accounts'), "price": price}
        else:
            return {"accounts": '', "price": price}
