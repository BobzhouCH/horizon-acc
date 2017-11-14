
from django.utils.translation import ugettext_lazy as _

import horizon

from easystack_dashboard.api import keystone
from easystack_dashboard.dashboards.identity import dashboard


class Tenants(horizon.Panel):
    name = _("Projects")
    slug = 'projects'

    def can_access(self, context):
        """We will show this for All types of users"""
        request = context['request']
        has_project = request.user.token.project.get('id') is not None
        is_admin = self.is_admin(request.user.token.roles)
        return super(Tenants, self).can_access(context) and (has_project or is_admin)

    def is_admin(self,roles):
        for role in roles:
            if (role['name'] == 'admin'):
                return True

        return False

dashboard.Identity.register(Tenants)
