from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.admin import dashboard


class Volumes(horizon.Panel):
    name = _("Volumes")
    slug = 'volumes'
    permissions = ('openstack.services.volume',)


dashboard.EasyStack_Admin.register(Volumes)
