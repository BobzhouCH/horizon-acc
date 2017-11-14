from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.admin import dashboard


class Instances(horizon.Panel):
    name = _("Instances")
    slug = 'instances'


dashboard.EasyStack_Admin.register(Instances)
