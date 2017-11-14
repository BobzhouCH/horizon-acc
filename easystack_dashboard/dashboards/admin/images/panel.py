from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.admin import dashboard


class Images(horizon.Panel):
    name = _("Images")
    slug = 'images'


dashboard.EasyStack_Admin.register(Images)
