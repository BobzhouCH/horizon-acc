from django.utils.translation import ugettext_lazy as _

import horizon

from lenovo_dashboard.dashboards.lenovo import dashboard


class Upgrade(horizon.Panel):
    name = _("Upgrade")
    slug = 'upgrade'
    icon_class = "mdi mdi-arrow-up-bold-circle"
    permissions = ('openstack.roles.admin',)
    admin_nav = True


dashboard.LenovoManager.register(Upgrade)
