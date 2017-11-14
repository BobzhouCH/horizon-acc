from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.admin import dashboard


class Routers(horizon.Panel):
    name = _("Routers")
    slug = 'routers'
    permissions = ('openstack.services.network',)

dashboard.EasyStack_Admin.register(Routers)
