from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.admin import dashboard
from django.conf import settings


class Notice(horizon.Panel):
    name = _("Notice")
    slug = 'notice'

    def can_access(self, context):
        notice_enable = getattr(settings, 'NOTICE_ENABLE', False)
        if not notice_enable:
            return False
        return True

dashboard.EasyStack_Admin.register(Notice)
