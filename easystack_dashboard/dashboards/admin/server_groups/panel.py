from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.admin import dashboard


class Server_groups(horizon.Panel):
    name = _("Server Groups")
    slug = 'server_groups'

dashboard.EasyStack_Admin.register(Server_groups)
