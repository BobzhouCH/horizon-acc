from django.utils.translation import ugettext_lazy as _  # noqa

import horizon

from easystack_dashboard.dashboards.project import dashboard


class Instances(horizon.Panel):
    name = _("Instances")
    slug = 'instances'


dashboard.Project.register(Instances)
