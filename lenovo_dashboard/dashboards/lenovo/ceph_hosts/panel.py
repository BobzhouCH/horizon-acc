from django.utils.translation import ugettext_lazy as _

import horizon

from lenovo_dashboard.dashboards.lenovo import dashboard


class StorageHostTable(horizon.Panel):
    name = _("Ceph Hosts")
    slug = "ceph_hosts"
    icon_class = "mdi mdi-apps"
    permissions = ('openstack.roles.admin',)
    admin_nav = True


dashboard.LenovoManager.register(StorageHostTable)
