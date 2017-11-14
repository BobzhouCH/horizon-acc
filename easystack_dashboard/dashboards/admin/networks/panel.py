from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.admin import dashboard


class Networks(horizon.Panel):
    name = _("Networks")
    slug = 'networks'

dashboard.EasyStack_Admin.register(Networks)
