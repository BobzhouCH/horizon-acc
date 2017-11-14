import json
import logging

from django.utils.translation import ugettext, ugettext_lazy as _

from easystack_dashboard import api, policy
from horizon import exceptions
from horizon import messages
from horizon import views
from horizon.utils import memoized
from lenovo_dashboard.api import lenovo_uus
from easystack_dashboard.api.rest import keystone

LOG = logging.getLogger(__name__)


class IndexView(views.APIView):
    # A very simple class-based view...
    template_name = 'admin/easystack_overview/table.html'

    @memoized.memoized_method
    def get_servers(self):
        client = lenovo_uus.client()

        servers = []
        stat = {}
        try:
            servers, stat = client.list_hosts()
            return servers, stat
        except Exception:
            exceptions.handle(self.request,
                              _('Unable to retrieve server list.'))

        return servers, stat

    @memoized.memoized_method
    def get_users(self):
        users = []

        if policy.check((("identity", "identity:list_users"),),
                        self.request):
            try:
                all_users = api.keystone.user_list(self.request)
                for user in all_users:
                    #if hasattr(user, 'default_project_id') or getattr(user, 'project_id', None) is not None:
                        #users.append(user)
                    if user.name not in keystone.OPENSTACK_USER:
                        users.append(user)
            except Exception:
                exceptions.handle(self.request,
                                  _('Unable to retrieve user list.'))
        else:
            msg = _("Insufficient privilege level to view user information.")
            messages.info(self.request, msg)

        return users

    @memoized.memoized_method
    def get_projects(self):
        projects = []

        if policy.check((("identity", "identity:list_projects"),), self.request):
            try:
                is_cloud_admin = api.keystone.is_cloud_admin(self.request)
                projects, has_more = api.keystone.dedicated_tenant_list(self.request,
                                                                        #user=self.request.user.id,
                                                                        admin=is_cloud_admin)
                for i, t in enumerate(projects):
                    if t.name == 'services':
                        projects.pop(i)

            except Exception:
                exceptions.handle(self.request,
                                  _('Unable to retrieve project list.'))
        else:
            msg = _("Insufficient privilege level to view project information.")
            messages.info(self.request, msg)

        return projects

    @staticmethod
    def calculate_server_series(servers):
        server_series = dict()

        for server in servers:
            current_roles = []
            if 'controller' in server['role_names']:
                current_roles.append('controller')
            if 'compute' in server['role_names']:
                current_roles.append('compute')
            if 'cinder' in server['role_names'] \
                    or 'ceph-osd' in server['role_names'] \
                    or 'storage' in server['role_names']:
                current_roles.append('storage')

            if len(current_roles) == 0:
                current_roles = ['others']

            series_key = '+'.join(current_roles)
            if not server_series.has_key(series_key):
                display_names = []
                for role in current_roles:
                    if role == 'controller':
                        display_names.append(ugettext("Controller"))
                    elif role == 'compute':
                        display_names.append(ugettext("Compute"))
                    elif role == 'storage':
                        display_names.append(ugettext("Storage"))
                    elif role == 'others':
                        display_names.append(ugettext("Others"))

                display_name = ' / '.join(display_names)

                server_series[series_key] = {
                    'name': display_name,
                    'value': 0,
                }

            server_series[series_key]['value'] += 1

        predefined = ['controller',
                      'controller+compute',
                      'controller+storage',
                      'compute',
                      'storage',
                      'compute+storage',
                      'controller+compute+storage']

        results = []
        for key in predefined:
            if key in server_series:
                results.append(server_series.pop(key))

        results.extend(server_series.values())
        return results

    def get_context_data(self, **kwargs):
        context = super(IndexView, self).get_context_data(**kwargs)

        servers, stat_info = self.get_servers()
        users = self.get_users()
        projects = self.get_projects()

        server_series = self.calculate_server_series(servers)
        server_total_count = len(servers)
        users_count = len(users)
        projects_count = len(projects)

        context['server_series_data'] = json.dumps(server_series)
        context['server_total_count'] = server_total_count
        context['users_count'] = users_count
        context['projects_count'] = projects_count
        #context['users'] = json.dumps(keystone.OPENSTACK_USER)
        return context
