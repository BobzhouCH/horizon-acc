# Copyright 2014 IBM Corp.
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


from __future__ import absolute_import

from django.conf import settings
from django import template

from easystack_dashboard.api import keystone
from easystack_dashboard.utils import file_parser

import copy
import re

register = template.Library()


def is_multidomain_supported():
    return (keystone.VERSIONS.active >= 3 and
            getattr(settings,
                    'OPENSTACK_KEYSTONE_MULTIDOMAIN_SUPPORT',
                    False))


@register.inclusion_tag('context_selection/_overview.html',
                        takes_context=True)
def show_overview(context):
    if 'request' not in context:
        return {}
    request = context['request']
    context = {'domain_supported': is_multidomain_supported(),
               'domain_name': request.user.user_domain_name,
               'project_name': request.user.project_name,
               'multi_region':
                   len(request.user.available_services_regions) > 1,
               'region_name': request.user.services_region,
               'request': request}

    return context


@register.inclusion_tag('context_selection/_domain_list.html',
                        takes_context=True)
def show_domain_list(context):
    # TODO(Thai): once domain switching is support, need to revisit
    if 'request' not in context:
        return {}
    request = context['request']
    context = {'domain_supported': is_multidomain_supported(),
               'domain_name': request.user.user_domain_name,
               'request': request}
    return context


@register.inclusion_tag('context_selection/_project_list.html',
                        takes_context=True)
def show_project_list(context):
    max_proj = getattr(settings,
                       'DROPDOWN_MAX_ITEMS',
                       30)
    if 'request' not in context:
        return {}
    request = context['request']
    dedicated = keystone.is_dedicated_context(request)
    project_name = request.user.project_name
    project_list = context['authorized_tenants']
    if dedicated:
        project_name = keystone.get_dedicated_name(str(project_name))
        project_list = keystone.dedicated_tenant_list(
            request, dedicated=dedicated, user=request.user.id)[0]
    context = {'projects': sorted(project_list,
                                  key=lambda project: project.name)[:],
               'project_id': request.user.project_id,
               'project_name': project_name,
               'request': request}
    return context


@register.inclusion_tag('context_selection/_region_list.html',
                        takes_context=True)
def show_region_list(context):
    if 'request' not in context:
        return {}
    request = context['request']
    region_name = get_region_name(request.user.services_region) or \
                  request.user.services_region
    region_list = sorted(request.user.available_services_regions)
    allow_tenants = file_parser.get_config_params('default', 'allow_tenants')
    if allow_tenants != None:
        allow_tenants_list = allow_tenants.split(',')
        allow_tenants_list = [element.strip() for element in allow_tenants_list]
        if request.user.tenant_id not in allow_tenants_list:
            for region in region_list:
                if keystone.is_public_region_name(region):
                    region_list.remove(region)
    else:
        for region in region_list:
            if keystone.is_public_region_name(region):
                region_list.remove(region)
    regions = {}
    default_url = request.horizon.get('panel').get_absolute_url()
    webroot = getattr(settings, 'WEBROOT')
    for region in region_list:
        display_name = get_region_name(region)
        if display_name is not None:
            item = {"display_name": display_name, "url": webroot + 'project/instances/'}
            regions.update({region: item})
        else:
            item = {"display_name": region, "url": default_url}
            regions.update({region: item})
    context = {'multi_region':
                   len(request.user.available_services_regions) > 1,
               'region_name': region_name,
               'regions': regions,
               'request': request}
    return context


@register.inclusion_tag('context_selection/_ticket_list.html',
                        takes_context=True)
def show_ticket_list(context):
    if 'request' not in context:
        return {}
    request = context['request']
    context = {
        'request': request
    }
    return context


def get_region_name(region):
    match = re.search(r'public_(\w+):(\w+)', region)
    if match:
        return match.group(2)
    return None


@register.tag(name="inRegionShowNode")
def inRegionShowNode(parser, token):
    try:
        nodelist = parser.parse(('endinRegionShowNode',))
        parser.delete_first_token()
        tag_name, nameid = token.split_contents()
    except ValueError:
        raise template.TemplateSyntaxError("%r tag requires a single argument" % token.contents.split()[0])
    if not (nameid[0] == nameid[-1] and nameid[0] in ('"', "'")):
        raise template.TemplateSyntaxError("%r tag's argument should be in quotes" % tag_name)
    return CurrentRegionNode(nameid[1:-1], nodelist)


class CurrentRegionNode(template.Node):
    def __init__(self, nameid, nodelist):
        self.nameid = nameid
        self.nodelist = nodelist

    def render(self, context):
        request = context['request']
        region = keystone.is_public_region(request, self.nameid)
        if region:
            return ''
        return self.nodelist.render(context)


@register.assignment_tag(takes_context=True)
def check_cloud_admin(context):
    request = context['request']
    return keystone.is_cloud_admin(request)


@register.assignment_tag(takes_context=True)
def check_domain_admin(context):
    request = context['request']
    return keystone.is_domain_admin(request)[1]


@register.assignment_tag(takes_context=True)
def check_project_admin(context):
    request = context['request']
    return keystone.is_project_admin(request)[1]
