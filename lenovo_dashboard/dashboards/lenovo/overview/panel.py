from django.utils.translation import ugettext_lazy as _

import horizon

from lenovo_dashboard.dashboards.lenovo import dashboard


class Overview(horizon.Panel):
    name = _("Overview")
    slug = "overview"
    nav = False


dashboard.LenovoManager.register(Overview)
