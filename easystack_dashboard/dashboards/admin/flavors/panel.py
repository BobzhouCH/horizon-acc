from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.admin import dashboard


class Flavors(horizon.Panel):
    name = _("Flavors")
    slug = 'flavors'


dashboard.EasyStack_Admin.register(Flavors)