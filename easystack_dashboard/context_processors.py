# -*- coding: utf-8 -*-
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
Context processors used by Horizon.
"""
from django.conf import settings
from easystack_dashboard.api.notice import notice
from easystack_dashboard.api import keystone


def openstack(request):
    """Context processor necessary for OpenStack Dashboard functionality.

    The following variables are added to the request context:

    ``authorized_tenants``
        A list of tenant objects which the current user has access to.

    ``regions``

        A dictionary containing information about region support, the current
        region, and available regions.
    """
    context = {}

    # Auth/Keystone context
    context.setdefault('authorized_tenants', [])
    if request.user.is_authenticated():
        context['authorized_tenants'] = [
            tenant for tenant in
            request.user.authorized_tenants if tenant.enabled]

        context['ISPUBLICREGION'] = keystone.is_public_region(request)

    # Region context/support
    available_regions = getattr(settings, 'AVAILABLE_REGIONS', [])
    regions = {'support': len(available_regions) > 1,
               'current': {'endpoint': request.session.get('region_endpoint'),
                           'name': request.session.get('region_name')},
               'available': [{'endpoint': region[0], 'name':region[1]} for
                             region in available_regions]}
    context['regions'] = regions
    # Adding webroot access
    context['WEBROOT'] = getattr(settings, "WEBROOT", "/")
    context['DEBUG_TOAST_ENABLED'] = getattr(settings,
                                             "DEBUG_TOAST_ENABLED",
                                             False)
    context['LDAP_EDITABLE'] = getattr(settings, "LDAP_EDITABLE", True)
    context['MANA_BILLING_ENABLE'] = getattr(
        settings, "MANA_BILLING_ENABLE", False)
    context['LOADBALANCER_ENABLE'] = getattr(settings, "OPENSTACK_NEUTRON_NETWORK", {}).get('enable_lb', False)
    context['MANA_ENABLE'] = getattr(settings, "MANA_ENABLE", False)
    context['MANILA_ENABLED'] = getattr(settings, "MANILA_ENABLED", False)
    context['TICKET_ENABLED'] = getattr(settings, "TICKET_ENABLED", False)
    context['DOMAIN_QUOTA_ENABLED'] = getattr(settings, "DOMAIN_QUOTA_ENABLED", False)
    notice_enable = getattr(settings, 'NOTICE_ENABLE', False)
    context['NOTICE_ENABLE'] = notice_enable
    context['EMAIL_ACTIVATION'] = getattr(settings, "EMAIL_ACTIVATION", True)
    context['RELEASE_NUM'] = getattr(settings, "RELEASE_NUM", '4.0.1')
    if notice_enable:
        context.update(notice.get_notice())
    return context
