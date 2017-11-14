# Copyright 2015 Easystack, Inc.
# bo.wang@easystack.cn
#

from django import shortcuts
from django.conf import settings
from easystack_dashboard.api import keystone


def switch_public(request):
    tenant_id = request.session.get('public_tenant')
    if tenant_id is None:
        for project in request.user.authorized_tenants:
            if not keystone.is_dedicated_name(project.name):
                tenant_id = project.id
                break
    webroot = getattr(settings, 'WEBROOT', '/')
    return shortcuts.redirect(webroot + 'auth/switch/' + tenant_id + '?next=' + webroot + 'project/')
