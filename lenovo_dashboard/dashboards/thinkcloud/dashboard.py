from django.utils.translation import ugettext_lazy as _

import horizon


class ThinkCloud(horizon.Dashboard):
    name = _("ThinkCloud")
    slug = 'thinkcloud'
    panels = ('help',)  # Add your panels here.
    default_panel = 'help'  # Specify the slug of the dashboard's default panel.
    nav = False


horizon.register(ThinkCloud)
