from django.utils.translation import ugettext_lazy as _

import horizon

from lenovo_dashboard.dashboards.lenovo import dashboard


class PhysicalServers(horizon.Panel):
    name = _("Physical Servers")
    slug = "physical_servers"
    icon_class = "mdi mdi-server"
    permissions = ('openstack.roles.admin',)
    admin_nav = True


dashboard.LenovoManager.register(PhysicalServers)
