from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.admin import dashboard


class VolumeTypes(horizon.Panel):
    name = _("Volume Types")
    slug = 'volume_types'
    permissions = ('openstack.services.volume',)


dashboard.EasyStack_Admin.register(VolumeTypes)
