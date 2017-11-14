# vim: tabstop=4 shiftwidth=4 softtabstop=4

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

from django.utils.translation import ugettext_lazy as _  # noqa
from django.conf import settings

import horizon


class ProjectOverviewPanels(horizon.PanelGroup):
    name = _('Project Overview')
    slug = 'PROJECTOVERVIEW'
    panels = (
        'easystack_overview',
    )


class MagnumOverviewPanels(horizon.PanelGroup):
    name = _('Magnum Overview')
    slug = 'MAGNUMOVERVIEW'
    panels = (
        'magnum_overview',
    )


class MagnumApplicationServicePanels(horizon.PanelGroup):
    name = _('Application Service')
    slug = 'MAGNUMAPPLICATIONSERVICE'
    panels = (
        'marathon_apps',
        'marathon_strategy',
        'marathon_images',
        'marathon_logs',
        'bays',
    )


class ComputePanels(horizon.PanelGroup):
    name = _('Compute Resource')
    slug = 'COMPUTE'
    panels = (
        'instances',
        'server_groups',
        'instance_snapshots',
        'baremetal',
        'images',
        'security_groups',
        'keypairs',
    )


class VolumePanels(horizon.PanelGroup):
    name = _('Volume Resource')
    slug = 'VOLUME'
    panels = ('volumes',
              'volume_snapshots',
              'volume_backups',
              )


class NetworkPanels(horizon.PanelGroup):
    name = _('Network Resource')
    slug = 'NETWORK'
    panels = ('networks',
              'ports',
              'routers',
              'loadbalancersv2',
              'floatingIP',
              'firewalls',
              'policytargets',
              'application_policy',
              'network_policy',
              'vpn',
              'topology',
              )

    # if not getattr(settings, 'USE_FANCIER_NETWORK_TOPOLOGY'):
    #     panels += ('network_topology',)
    # else:
    #     panels += ('community_network_topology',)


class SettingPanels(horizon.PanelGroup):
    name = _('Management')
    slug = 'Management'
    panels = ('alarms',
              'alerts',
              'operationlogs',
              'billing',
              'tickets'
              )


class Project(horizon.Dashboard):
    name = _('Project Manage')
    slug = 'project'

    panels = (ProjectOverviewPanels,
              ComputePanels, VolumePanels,
              NetworkPanels, SettingPanels,)
    default_panel = 'easystack_overview'

    def can_access(self, context):
        request = context['request']
        has_project = request.user.token.project.get('id') is not None
        return super(Project, self).can_access(context) and has_project

horizon.register(Project)
