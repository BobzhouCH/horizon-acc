from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.project import dashboard

from easystack_dashboard.api import keystone

class Security_Groups(horizon.Panel):
    name = _("SecurityGroup")
    slug = 'security_groups'

    def can_access(self, context):
        request = context['request']
        public_region = keystone.is_public_region(request,'Security_Groups')
        if public_region:
            return False
        return True

dashboard.Project.register(Security_Groups)
