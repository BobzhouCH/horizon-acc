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

from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.project import dashboard
from django.conf import settings  # noqa
from easystack_dashboard.api import keystone


class Billing(horizon.Panel):
    name = _("Billing Overview")
    slug = 'billing'

    def can_access(self, context):
        request = context['request']
        public_region = keystone.is_public_region(request,'Billing')
        if public_region:
            return False
        billing_enable = getattr(settings, 'ENABLE_BILLING', False)
        if not billing_enable or \
                keystone.is_cloud_admin(request) or \
                keystone.is_dedicated_context(request) or \
                keystone.is_default_domain_member(request)[1]:
            return False
        return True

dashboard.Project.register(Billing)
