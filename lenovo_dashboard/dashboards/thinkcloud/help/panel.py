from django.utils.translation import ugettext_lazy as _

import horizon

from lenovo_dashboard.dashboards.thinkcloud import dashboard


class Help(horizon.Panel):
    name = _("Help")
    slug = "help"
    icon_class = "mdi mdi-help"


dashboard.ThinkCloud.register(Help)
