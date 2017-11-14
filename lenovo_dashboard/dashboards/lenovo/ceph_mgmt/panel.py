from django.utils.translation import ugettext_lazy as _

import horizon

from lenovo_dashboard.dashboards.lenovo import dashboard


class StorageMgmt(horizon.Panel):
    name = _("Ceph Overview")
    slug = "ceph_mgmt"
    icon_class = "mdi mdi-console"
    permissions = ('openstack.roles.admin',)
    admin_nav = True


dashboard.LenovoManager.register(StorageMgmt)
