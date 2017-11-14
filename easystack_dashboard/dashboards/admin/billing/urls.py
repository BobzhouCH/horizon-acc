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

from django.conf.urls import include  # noqa
from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template

from easystack_dashboard.dashboards.admin.billing.accounts \
    import urls as accounts_urls
from easystack_dashboard.dashboards.admin.billing.prices \
    import urls as prices_urls
from easystack_dashboard.dashboards.admin.billing \
    import views


urlpatterns = patterns(
    'easystack_dashboard.dashboards.admin.billing.views',
    url(r'^$',
        template.as_view(template_name="admin/billing/table.html")),
    url(r'^form/$',
        template.as_view(template_name="admin/billing/form.html")),
    url(r'^fixprice-detail/$',
        template.as_view(template_name="admin/billing/fixprice-detail.html")),
    url(r'^accounts/', include(accounts_urls, namespace='accounts')),
    url(r'^prices/', include(prices_urls, namespace='prices')),
    url(r'^$', views.IndexView.as_view(), name='index'),
)
