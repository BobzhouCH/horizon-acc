from django.utils.translation import ugettext_lazy as _

import horizon

from easystack_dashboard.api import keystone


class Identity(horizon.Dashboard):
    name = _("Identity Manage")
    slug = "identity"
    default_panel = 'projects'
    panels = ('domains', 'projects', 'users',)

    def can_access(self, context):
        request = context['request']
        public_region = keystone.is_public_region(request,'Identity')
        if public_region:
            return False
        v3, domain_admin = keystone.is_domain_admin(request)
        v3, project_admin = keystone.is_project_admin(request)
        if v3:
            return super(Identity, self).can_access(context)\
                and (domain_admin or project_admin)
        return super(Identity, self).can_access(context)

horizon.register(Identity)
