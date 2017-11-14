from django.utils.translation import ugettext_lazy as _
import horizon
from easystack_dashboard.api import keystone

class CephStoragePanels(horizon.PanelGroup):
    name = _('Ceph Management')
    slug = 'ceph Management'
    panels = (
        'ceph_mgmt',
        'ceph_hosts',
        'ceph_pools',
    )

class InfrastructurePanels(horizon.PanelGroup):
    name = _('Infrastructure')
    slug = 'infrastructure'
    panels = (
        'physical_servers',
        'network_switches',
        'upgrade',
    )
    nav = False


class Vmwaremgmt(horizon.PanelGroup):
    name = _('vmware datacenter')
    slug = 'vmwaremgmt'
    panels = (
        'vmwaremgmt',
    )

#class PolicyManagementPanels(horizon.PanelGroup):
#    name = _('Policy Management')
#    slug = 'policy'
#    panels = (
#        'ha_management',
#    )


class MiscPanels(horizon.PanelGroup):
    name = _('Miscellaneous')
    slug = 'misc'
    panels = (
        'overview',
    )
    nav = False


class LenovoManager(horizon.Dashboard):
    name = _("Lenovo Manager")
    slug = 'lenovo'
    from django.conf import settings
    use_ceph = getattr(settings,'USE_CEPH',  None)
    if use_ceph == True:
        panels = (InfrastructurePanels, MiscPanels, CephStoragePanels)    # The Vmwaremgmt panel will be added by patching
    else:
        panels = (InfrastructurePanels, Vmwaremgmt, MiscPanels)
    default_panel = 'overview'  # Specify the slug of the dashboard's default panel.

    def can_access(self, context):
        request = context['request']
        cloud_admin = keystone.is_cloud_admin(request)
        is_access = super(LenovoManager, self).can_access(context)

        return is_access and cloud_admin


horizon.register(LenovoManager)