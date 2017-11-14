from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.admin import dashboard


class Volume_Snapshots(horizon.Panel):
    name = _("Volume Snapshots")
    slug = 'volume_snapshots'


dashboard.EasyStack_Admin.register(Volume_Snapshots)
