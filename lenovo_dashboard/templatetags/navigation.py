# Copyright 2016 Lenovo, Inc.
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

import logging

from django import template

from horizon.base import Horizon, NotRegistered
from horizon.templatetags.horizon import has_permissions

from easystack_dashboard.templatetags import context_selection
from easystack_dashboard.views import get_user_home
from lenovo_dashboard.utils.site_nav import can_access_dashboard, can_access_panel, is_admin_panel


LOG = logging.getLogger(__name__)

register = template.Library()

DEFAULT_MENU_COLUMNS = 3
MEGA_MENU_MIN_ITEMS = 10
MEGA_MENU_MAX_ITEMS = 25

@register.assignment_tag(takes_context=True)
def user_home_url(context):
    request = context['request']
    return get_user_home(request.user)

@register.assignment_tag
def check_selector_multidomain():
    if callable(getattr(context_selection, 'is_multidomain', None)):
        return context_selection.is_multidomain()
    else:
        return context_selection.is_multidomain_supported()


@register.assignment_tag(takes_context=True)
def check_selector_multiregion(context):
    if 'request' not in context:
        return False

    request = context['request']
    if callable(getattr(context_selection, 'is_multi_region', None)):
        return context_selection.is_multi_region(request)
    else:
        return len(request.user.available_services_regions) > 1


@register.inclusion_tag('horizon/common/_megamenu_nav.html', takes_context=True)
def horizon_admin_megamenu(context):
    dashboards = [dash for dash in Horizon.get_dashboards()
                  if dash.slug not in ('project', 'settings')]

    return get_megamenu_data(context, dashboards, system_menu=True)


@register.inclusion_tag('horizon/common/_megamenu_nav.html', takes_context=True)
def horizon_service_megamenu(context):
    dashboards = [dash for dash in Horizon.get_dashboards()
                  if dash.slug not in ('admin', 'identity', 'settings',)]

    return get_megamenu_data(context, dashboards, system_menu=False)


def get_megamenu_data(context, dashboards, system_menu=False):
    if 'request' not in context:
        return {}
    current_dashboard = context['request'].horizon.get('dashboard', None)
    current_panel = context['request'].horizon.get('panel', None)
    user = context['request'].user

    menu_groups = []
    total_items = 0
    max_group_items = 0

    for dash in dashboards:
        if not can_access_dashboard(context, dash):
            continue

        panel_groups = dash.get_panel_groups()
        for group in panel_groups.values():
            allowed_panels = []
            for panel in group:
                if can_access_panel(context, panel) and \
                        has_permissions(user, panel):
                    panel_id = ':'.join([dash.slug, panel.slug])

                    if panel_id in NAV_HIDDEN_PANELS:
                        skipped = True
                    else:
                        skipped = False

                    if not skipped and system_menu == is_admin_panel(context, dash, panel):
                        allowed_panels.append(panel)

            if len(allowed_panels) > 0:
                if group.name:
                    menu_groups.append({'title': group.name,
                                        'dash': dash,
                                        'panels': allowed_panels})
                else:
                    menu_groups.append({'title': dash.name,
                                        'dash': dash,
                                        'panels': allowed_panels})

                total_items += len(allowed_panels) + 1
                max_group_items = max(max_group_items, (len(allowed_panels) + 1))

    col_limit = max(MEGA_MENU_MIN_ITEMS,
                    max_group_items,
                    round(float(total_items) / float(DEFAULT_MENU_COLUMNS)))

    column_components = []
    current_column = list()
    current_count = 0
    column_components.append(current_column)
    for group in menu_groups:
        if (current_count + len(group['panels']) + 1) > col_limit and \
                        current_count != 0:
            current_column = list()
            current_count = 0
            column_components.append(current_column)

        current_column.append(group)
        current_count += len(group['panels']) + 1

    return {'column_components': column_components,
            'user': context['request'].user,
            'current': current_dashboard,
            'current_panel': current_panel.slug if current_panel else '',
            'request': context['request']}


NAV_HIDDEN_PANELS = (
    'admin:easystack_overview',
)


@register.simple_tag
def panel_icon_class(dash, panel):
    panel_id = ':'.join([dash.slug, panel.slug])

    if hasattr(panel, 'icon_class'):
        return getattr(panel, 'icon_class')

    return CORE_PANEL_ICONS.get(panel_id, DEFAULT_PANEL_ICON)


CORE_PANEL_ICONS = {
    'admin:aggregates': "mdi mdi-view-module",
    'admin:defaults': "mdi mdi-settings",
    'admin:flavors': "mdi mdi-drawing",
    'admin:hypervisors': "mdi mdi-domain",
    'admin:images': "mdi mdi-zip-box",
    'admin:info': "mdi mdi-clipboard-text",
    'admin:instances': "mdi mdi-apps",
    'admin:instance_snapshots': "mdi mdi-camera",
    'admin:metadata_defs': "mdi mdi-file-document",
    'admin:metering': "mdi mdi-speedometer",
    'admin:networks': "mdi mdi-server-network",
    'admin:overview': "mdi mdi-eye",
    'admin:routers': "mdi mdi-routes",
    'admin:volumes': "mdi mdi-dns",
    'admin:volume_snapshots': "mdi mdi-camera-party-mode",
    'admin:volume_types': "mdi mdi-drawing-box",
    'admin:billing': "mdi mdi-cash-usd",
    'admin:bill': "mdi mdi-clipboard-text",
    'admin:invcode': "mdi mdi-barcode",
    'identity:domains': "mdi mdi-domain",
    'identity:groups': "mdi mdi-account-multiple",
    'identity:ngusers': "mdi mdi-account",
    'identity:projects': "mdi mdi-format-list-bulleted",
    'identity:roles': "mdi mdi-folder-account",
    'identity:users': "mdi mdi-account",
    'project:easystack_overview': "mdi mdi-home",
    'project:access_and_security': "mdi mdi-eye",
    'project:security_groups': "mdi mdi-eye",
    'project:keypairs': "mdi mdi-key-variant",
    'project:containers': "mdi mdi-cube-outline",
    'project:firewalls': "mdi mdi-security-network",
    'project:images': "mdi mdi-zip-box",
    'project:instances': "mdi mdi-apps",
    'project:instance_snapshots': "mdi mdi-camera",
    'project:loadbalancers': "mdi mdi-server-plus",
    'project:network_topology': "mdi mdi-vector-square",
    'project:community_network_topology': "mdi mdi-vector-square",
    'project:networks': "mdi mdi-server-network",
    'project:ports': "mdi mdi-export",
    'project:floatingIP': "mdi mdi-label-outline",
    'project:overview': "mdi mdi-eye",
    'project:routers': "mdi mdi-routes",
    'project:stacks': "mdi mdi-cube-unfolded",
    'project:volumes': "mdi mdi-dns",
    'project:volume_snapshots': "mdi mdi-camera-party-mode",
    'project:volume_backups': "mdi mdi-backup-restore",
    'project:vpn': "mdi mdi-server-security",
    'project:stacks:resource_types': "mdi mdi-shape-plus",
    'project:alarms': "mdi mdi-bell",
    'project:operationlogs': "mdi mdi-timelapse",
    'settings:password': "mdi mdi-account-key",
    'settings:user': "mdi mdi-account",
    'infrastructure:networking': "mdi mdi-vector-square",
    'infrastructure:pfa': "mdi mdi-alert-circle",
    'infrastructure:servers': "mdi mdi-server",
    'infrastructure:monitoring': "mdi mdi-eye",
    'infrastructure:monitoring_hosts': "mdi mdi-desktop-tower",
    'infrastructure:monitoring_services': "mdi mdi-earth",
}

DEFAULT_PANEL_ICON = "mdi mdi-star"


def get_nav_collapsed(request):
    result = request.COOKIES.get('nav_collapse')
    return result == "true"


@register.assignment_tag(takes_context=True)
def is_nav_collapsed(context):
    request = context['request']
    return get_nav_collapsed(request)


@register.inclusion_tag('horizon/common/_side_launcher.html', takes_context=True)
def horizon_side_launcher(context):
    if 'request' not in context:
        return {}

    request = context['request']
    current_dashboard = request.horizon.get('dashboard', None)
    current_panel = request.horizon.get('panel', None)
    nav_collapsed = get_nav_collapsed(request)

    # LOG.debug("Current dashboard: {0}".format(current_dashboard))
    # LOG.debug("Current panel: {0}".format(current_panel))

    launch_panels = []

    if request.path == get_user_home(request.user):
        has_current_panel = True
    else:
        has_current_panel = False

    for item in DEFAULT_LAUNCH_ITEMS:
        try:
            dash_name, panel_name = item.split(':')
            dash = Horizon.get_dashboard(dash_name)
            panel = dash.get_panel(panel_name)
        except ValueError as e:
            continue
        except NotRegistered as e:
            continue

        if not can_access_dashboard(context, dash):
            continue

        if can_access_panel(context, panel):
            launch_panels.append((dash, panel))

        if panel == current_panel:
            has_current_panel = True

    if not has_current_panel:
        launch_panels.append((current_dashboard, current_panel))

    return {'components': launch_panels,
            'user': context['request'].user,
            'current': current_dashboard,
            'current_panel': current_panel.slug if current_panel else '',
            'request': context['request'],
            'authorized_tenants': context['authorized_tenants'],
            'nav_collapsed': nav_collapsed}


DEFAULT_LAUNCH_ITEMS = [
    'project:instances',
    'project:volumes',
    'project:images',
    'project:networks',
    'project:floatingIP',
    'admin:bill'
    'admin:servers',
    'admin:networking',
]
