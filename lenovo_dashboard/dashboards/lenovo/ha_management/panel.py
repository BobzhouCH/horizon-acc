from django.utils.translation import ugettext_lazy as _

import horizon

from lenovo_dashboard.dashboards.lenovo import dashboard


class HAManagement(horizon.Panel):
    name = _("HA Management")
    slug = "ha_management"
    icon_class = "mdi mdi-server"
    permissions = ('openstack.roles.admin',)
    admin_nav = True


dashboard.LenovoManager.register(HAManagement)
