from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.project import dashboard

from easystack_dashboard.api import keystone

class Volume_Backups(horizon.Panel):
    name = _("Volume Backups")
    slug = 'volume_backups'

    def can_access(self, context):
        request = context['request']
        public_region = keystone.is_public_region(request,'Volume Backups')
        if public_region:
            return False
        return True

dashboard.Project.register(Volume_Backups)
