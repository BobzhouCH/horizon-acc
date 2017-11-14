from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.admin import dashboard
from django.conf import settings


class InvitationCode(horizon.Panel):
    name = _("Invitation Code")
    slug = 'invcode'

    def can_access(self, context):
        return getattr(settings, 'INVCODE_ENABLE', False)

dashboard.EasyStack_Admin.register(InvitationCode)
