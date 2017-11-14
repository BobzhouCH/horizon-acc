from django.utils.translation import ugettext_lazy as _  # noqa
from openstack_auth import utils as auth_utils

from easystack_dashboard.api import keystone
import horizon


class EasyStack_Admin(horizon.Dashboard):
    name = _('Admin Manage')
    slug = 'admin'
    panels = ('easystack_overview',
              'instances',
              'server_groups',
              'flavors',
              'instance_snapshots',
              'images',
              'ironic',
              'volumes',
              'volume_snapshots',
              'volume_types',
              'networks',
              'routers',
              'hypervisors',
              'container_images',
              'aggregates',
              'info',
              'billing',
              'bill',
              'invcode',
              'tickets',
              'notice',
              'bay_models',
              'optimize',
              'security_settings'
              )
    default_panel = 'easystack_overview'

    def can_access(self, context):
        request = context['request']
        public_region = keystone.is_public_region(request,'EasyStack_Admin')
        if public_region:
            return False
        is_access = super(EasyStack_Admin, self).can_access(context)
        cloud_admin = keystone.is_cloud_admin(request)
        v3, project_admin = keystone.is_project_admin(request)
        if v3:
            return is_access and cloud_admin and project_admin
        return is_access
horizon.register(EasyStack_Admin)
