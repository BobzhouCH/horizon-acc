from django.utils.translation import ugettext_lazy as _

import horizon

from easystack_dashboard.dashboards.project import dashboard


class Topology(horizon.Panel):
    name = _("Network Topology")
    slug = "topology"
    permissions = ('openstack.services.network', )
    icon_class = "mdi mdi-vector-square"


dashboard.Project.register(Topology)
