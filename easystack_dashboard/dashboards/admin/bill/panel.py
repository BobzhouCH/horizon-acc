from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.admin import dashboard
from django.conf import settings  # noqa


class Bill(horizon.Panel):
    name = _("Bill")
    slug = 'bill'

    def can_access(self, context):
        billing_enable = getattr(settings, 'ENABLE_BILLING', False)
        if not billing_enable:
            return False
        return True

dashboard.EasyStack_Admin.register(Bill)
