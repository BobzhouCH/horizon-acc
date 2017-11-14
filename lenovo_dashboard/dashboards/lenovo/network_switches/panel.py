from django.utils.translation import ugettext_lazy as _

import horizon

from lenovo_dashboard.dashboards.lenovo import dashboard


class NetworkSwitches(horizon.Panel):
    name = _("Network Switches")
    slug = "network_switches"
    icon_class = "mdi mdi-vector-square"
    permissions = ('openstack.roles.admin',)
    admin_nav = True


dashboard.LenovoManager.register(NetworkSwitches)
