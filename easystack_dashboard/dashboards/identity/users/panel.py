from django.utils.translation import ugettext_lazy as _

import horizon

from easystack_dashboard.api import keystone
from easystack_dashboard.dashboards.identity import dashboard


class Users(horizon.Panel):
    name = _("Users")
    slug = 'users'

    def can_access(self, context):
        request = context['request']
        v3, domain_admin = keystone.is_domain_admin(request)
        if v3:
            return super(Users, self).can_access(context) and domain_admin
        return super(Users, self).can_access(context)

dashboard.Identity.register(Users)
