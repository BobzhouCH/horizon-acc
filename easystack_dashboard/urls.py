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

"""
URL patterns for the EasyStack Dashboard.
"""

from django.conf import settings
from django.conf.urls import include
from django.conf.urls import patterns
from django.conf.urls.static import static  # noqa
from django.conf.urls import url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns  # noqa
from easystack_dashboard import views
from easystack_dashboard.api import signup
from django.views.generic import TemplateView as template

import horizon

urlpatterns = patterns(
    '',
    url(r'^$', 'easystack_dashboard.views.splash', name='splash'),
    url(r'^api/', include('easystack_dashboard.api.rest.urls')),
    url(r'^user/$', views.user, name='user'),
    url(r'^register/active_reminder/$',
        views.active_reminder, name='active_reminder'),
    url(r'^register/$', views.register, name='register'),
    url(r'^agreement/$', views.agreement, name='agreement'),
    url(r'^department/$', views.department, name='department'),
    url(r'^captcha/$', views.captcha, name='captcha'),
    url(r'^verify/$', views.verify, name='verify'),
    url(r'^email/$', views.verify_email, name='verify_email'),
    url(r'^phonecode/$', views.phone_code, name='phone_code'),
    url(r'^registration/(?P<user_id>[^/]+)',
        views.active_user, name='active_user'),
    url(r'^invitationcode/$', signup.verify_invitation_code,
        name='verify_invitation_code'),
    url(r'', include(horizon.urls)),
    url(r'^browers/$', template.as_view(template_name="browers.html")),
)

for u in getattr(settings, 'AUTHENTICATION_URLS', ['openstack_auth.urls']):
    urlpatterns += patterns(
        '',
        url(r'^auth/', include(u))
    )

# Development static app and project media serving using the staticfiles app.
urlpatterns += staticfiles_urlpatterns()

# Convenience function for serving user-uploaded media during
# development. Only active if DEBUG==True and the URL prefix is a local
# path. Production media should NOT be served by Django.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

if settings.DEBUG:
    urlpatterns += patterns(
        '',
        url(r'^500/$', 'django.views.defaults.server_error'),
        url(r'^404/$', 'django.views.defaults.page_not_found'),
        url(r'^403/$', 'django.views.defaults.permission_denied'),
    )
