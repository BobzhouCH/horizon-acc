from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.admin import dashboard


class Aggregates(horizon.Panel):
    name = _("Aggregates / AZ")
    slug = 'aggregates'


dashboard.EasyStack_Admin.register(Aggregates)
