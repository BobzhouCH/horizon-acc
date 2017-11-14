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

from django.conf.urls import patterns
from django.conf.urls import url

# from easystack_dashboard.dashboards.admin.security_settings import views
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    # '',
    # url(r'^$', views.SecuritySettingsView.as_view(), name='index'),
    '',
    url(r'^$',
        template.as_view(template_name="admin/security_settings/index.html"),
        name='index')
)
