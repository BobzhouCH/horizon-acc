from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.project import dashboard

from easystack_dashboard.api import keystone


class Instance_Snapshots(horizon.Panel):
    name = _("Instance Snapshots")
    slug = 'instance_snapshots'

    def can_access(self, context):
        request = context['request']
        public_region = keystone.is_public_region(request,'Instance_Snapshots')
        if public_region:
            return False
        return True

dashboard.Project.register(Instance_Snapshots)
