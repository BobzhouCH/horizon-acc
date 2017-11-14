from django.utils.translation import ugettext_lazy as _

import horizon

from easystack_dashboard.api import keystone
from easystack_dashboard.dashboards.identity import dashboard


class Domains(horizon.Panel):
    name = _("Domains")
    slug = 'domains'

    def can_access(self, context):
        """
            Make sure only cloud admin can see domain panel.
        """
        request = context['request']
        # cloud_admin will be judged by if domain_token's domain name is 'Default'
        # only cloud admin can access domains panel.
        v3, cloud_admin = keystone.is_default_domain_admin(request)
        if v3:
            return super(Domains, self).can_access(context) and cloud_admin
        return super(Domains, self).can_access(context)

if keystone.VERSIONS.active >= 3:
    dashboard.Identity.register(Domains)
