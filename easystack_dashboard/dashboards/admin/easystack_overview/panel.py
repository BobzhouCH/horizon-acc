from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.admin import dashboard


class easystack_overview(horizon.Panel):
    name = _("Overview")
    slug = 'easystack_overview'

dashboard.EasyStack_Admin.register(easystack_overview)
