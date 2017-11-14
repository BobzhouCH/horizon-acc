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

from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic.base import TemplateView as template

from easystack_dashboard.dashboards.project.billing import views

urlpatterns = patterns(
    'easystack_dashboard.dashboards.project.billing.views',
    url(r'^$', views.index_account_view),
    url(r'^detail/$',
        template.as_view(template_name="project/billing/detail.html")),
    url(r'^charge/$',
        template.as_view(template_name="project/billing/charge.html")),
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'alipay_url$', views.alipay_url_handler, name='alipay_url_handler'),
    url(r'yeepay_url$', views.yeepay_url_handler, name='yeepay_url_handler'),
    url(r'^success/$', template.as_view(template_name='project/billing/success.html'),
        name="payment_success"),
    url(r'^error/$', template.as_view(template_name='project/billing/error.html'),
        name="payment_error"),
    url(r'^bill_download/$', views.products_download,
        name="products_download"),
)
