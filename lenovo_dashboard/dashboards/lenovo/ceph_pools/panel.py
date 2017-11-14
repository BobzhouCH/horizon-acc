from django.utils.translation import ugettext_lazy as _

import horizon

from lenovo_dashboard.dashboards.lenovo import dashboard


class StoragePools(horizon.Panel):
    name = _("Ceph Pools")
    slug = "ceph_pools"
    icon_class = "mdi mdi-relative-scale"
    permissions = ('openstack.roles.admin',)
    admin_nav = True


dashboard.LenovoManager.register(StoragePools)
