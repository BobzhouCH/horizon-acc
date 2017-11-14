from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.project import dashboard

from easystack_dashboard.api import keystone


class FloatingIP(horizon.Panel):
    name = _("FloatingIP")
    slug = 'floatingIP'

    def can_access(self, context):
        request = context['request']
        public_region = keystone.is_public_region(request,'FloatingIP')
        if public_region:
            return False
        return True


dashboard.Project.register(FloatingIP)
