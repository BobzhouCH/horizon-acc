from collections import defaultdict
import itertools
import logging
import json
import string
from django.views import generic
from django.utils.translation import ugettext_lazy as _

from horizon import exceptions
from horizon.utils.memoized import memoized  # noqa

from easystack_dashboard.api import base
from easystack_dashboard.api import cinder
from easystack_dashboard.api import keystone
from easystack_dashboard.api import network
from easystack_dashboard.api import neutron
from easystack_dashboard.api import lbaasv2
from easystack_dashboard.api import nova
from easystack_dashboard import policy
from easystack_dashboard.api.rest import urls
from easystack_dashboard.api.rest import utils as rest_utils
from easystack_dashboard import settings
LOG = logging.getLogger(__name__)


NOVA_QUOTA_FIELDS = ("metadata_items",
                     "cores",
                     "instances",
                     "injected_files",
                     "injected_file_content_bytes",
                     "ram",
                     "floating_ips",
                     "fixed_ips",
                     "security_groups",
                     "security_group_rules",)

MISSING_QUOTA_FIELDS = ("key_pairs",
                        "injected_file_path_bytes",)

CINDER_QUOTA_FIELDS = ("volumes",
                       "snapshots",
                       "gigabytes",
                       "backups",
                       "backup_gigabytes")

NEUTRON_QUOTA_FIELDS = ("network",
                        "subnet",
                        "port",
                        "router",
                        "floatingip",
                        "security_group",
                        "security_group_rule",
                        )
LOADBALANCER_QUOTA_FIELDS = ("healthmonitor",
                             "listener",
                             "pool",
                             "loadbalancer",
                             )

QUOTA_FIELDS = NOVA_QUOTA_FIELDS + CINDER_QUOTA_FIELDS + NEUTRON_QUOTA_FIELDS

#this mapping is to resolve the differnce of the proj quota's name and domain quota's name
#the attr is domain quota's name ,the value is the proj quota's name
DOMAIN_PROJ_QUOTA_MAP = {
    'ram': 'ram', 'subnet': 'subnets', 'cores': 'cores', 'instances': 'instances', 'key_pairs': 'key_pairs',
    'volumes': 'volumes', 'floatingip': 'floating_ips', 'network': 'networks', 'router': 'routers',
    'security_group': 'security_groups', 'volume_snapshots': 'snapshots', 'volume_gigabytes': 'gigabytes',
    'healthmonitor': 'healthmonitors', 'listener': 'listeners', 'loadbalancer': 'loadbalancers','pool': 'pools',
    'shares': 'shares', 'share_gigabytes': 'share_gigabytes', 'share_snapshots': 'share_snapshots',
    'share_networks': 'share_networks', 'port': 'ports', 'backups': 'backups', 'backup_gigabytes': 'backup_gigabytes'
}


QUOTA_NAMES = {
    "metadata_items": _('Metadata Items'),
    "cores": _('VCPUs'),
    "instances": _('Instances'),
    "injected_files": _('Injected Files'),
    "injected_file_content_bytes": _('Injected File Content Bytes'),
    "ram": _('RAM (MB)'),
    "floating_ips": _('Floating IPs'),
    "fixed_ips": _('Fixed IPs'),
    "security_groups": _('Security Groups'),
    "security_group_rules": _('Security Group Rules'),
    "key_pairs": _('Key Pairs'),
    "injected_file_path_bytes": _('Injected File Path Bytes'),
    "volumes": _('Volumes'),
    "snapshots": _('Volume Snapshots'),
    "gigabytes": _('Total Size of Volumes and Snapshots (GB)'),
    "network": _("Networks"),
    "subnet": _("Subnets"),
    "port": _("Ports"),
    "router": _("Routers"),
    "floatingip": _('Floating IPs'),
    "security_group": _("Security Groups"),
    "security_group_rule": _("Security Group Rules")
}


class QuotaUsage(dict):
    """Tracks quota limit, used, and available for a given set of quotas."""

    def __init__(self):
        self.usages = defaultdict(dict)

    def __contains__(self, key):
        return key in self.usages

    def __getitem__(self, key):
        return self.usages[key]

    def __setitem__(self, key, value):
        raise NotImplementedError("Directly setting QuotaUsage values is not "
                                  "supported. Please use the add_quota and "
                                  "tally methods.")

    def __repr__(self):
        return repr(dict(self.usages))

    def get(self, key, default=None):
        return self.usages.get(key, default)

    def add_quota(self, quota):
        """Adds an internal tracking reference for the given quota."""
        if quota.limit is None or quota.limit == -1:
            # Handle "unlimited" quotas.
            self.usages[quota.name]['quota'] = -1
            self.usages[quota.name]['available'] = -1
        else:
            self.usages[quota.name]['quota'] = int(quota.limit)

    def tally(self, name, value):
        """Adds to the "used" metric for the given quota."""
        value = value or 0  # Protection against None.
        # Start at 0 if this is the first value.

        if 'used' not in self.usages[name]:
            self.usages[name]['used'] = 0
        # Increment our usage and update the "available" metric.
        self.usages[name]['used'] += int(value)  # Fail if can't coerce to int.
        self.update_available(name)

    def update_available(self, name):
        """Updates the "available" metric for the given quota."""
        quota = self.usages[name]['quota']
        available = quota - self.usages[name]['used']
        if available < 0:
            available = 0
        if quota == -1:
            available = -1
        self.usages[name]['available'] = available

def _get_volume_quota(request, tenant_id, disabled_quotas):
    quotasets = []
    qs = base.QuotaSet()
    quotasets.append(cinder.tenant_quota_get(request, tenant_id))
    for quota in itertools.chain(*quotasets):
        if quota.name not in disabled_quotas:
            qs[quota.name] = quota.limit
    return qs

def _get_nova_quota(request, tenant_id, disabled_quotas):
    quotasets = []
    qs = base.QuotaSet()
    quotasets.append(nova.tenant_quota_get(request, tenant_id))
    for quota in itertools.chain(*quotasets):
        if quota.name not in disabled_quotas:
            qs[quota.name] = quota.limit
    return qs

def _get_neutron_quota(request, tenant_id, disabled_quotas):
    quotasets = []
    qs = base.QuotaSet()
    # Check if neutron is enabled by looking for network and router
    if 'network' not in disabled_quotas and 'router' not in disabled_quotas:
        tenant_id = tenant_id or request.user.tenant_id
        neutron_quotas = neutron.tenant_quota_get(request, tenant_id)
    if 'floating_ips' in disabled_quotas:
        # Neutron with quota extension disabled
        if 'floatingip' in disabled_quotas:
            qs.add(base.QuotaSet({'floating_ips': -1}))
        # Neutron with quota extension enabled
        else:
            # Rename floatingip to floating_ips since that's how it's
            # expected in some places (e.g. Security & Access' Floating IPs)
            fips_quota = neutron_quotas.get('floatingip').limit
            qs.add(base.QuotaSet({'floating_ips': fips_quota}))
    if 'security_groups' in disabled_quotas:
        if 'security_group' in disabled_quotas:
            qs.add(base.QuotaSet({'security_groups': -1}))
        # Neutron with quota extension enabled
        else:
            # Rename security_group to security_groups since that's how it's
            # expected in some places (e.g. Security & Access' Security Groups)
            sec_quota = neutron_quotas.get('security_group').limit
            qs.add(base.QuotaSet({'security_groups': sec_quota}))
    if 'network' in disabled_quotas:
        for item in qs.items:
            if item.name == 'networks':
                qs.items.remove(item)
                break
    else:
        net_quota = neutron_quotas.get('network').limit
        qs.add(base.QuotaSet({'networks': net_quota}))
    if 'subnet' in disabled_quotas:
        for item in qs.items:
            if item.name == 'subnets':
                qs.items.remove(item)
                break
    else:
        net_quota = neutron_quotas.get('subnet').limit
        qs.add(base.QuotaSet({'subnets': net_quota}))
    if 'router' in disabled_quotas:
        for item in qs.items:
            if item.name == 'routers':
                qs.items.remove(item)
                break
    else:
        router_quota = neutron_quotas.get('router').limit
        qs.add(base.QuotaSet({'routers': router_quota}))

    if not keystone.is_public_region(request):
        if 'loadbalancer' in disabled_quotas:
            for item in qs.items:
                if item.name == 'loadbalancers':
                    qs.items.remove(item)
                    break
        else:
            loadbalancer_quota = neutron_quotas.get('loadbalancer').limit
            qs.add(base.QuotaSet({'loadbalancers': loadbalancer_quota}))

        if 'listener' in disabled_quotas:
            for item in qs.items:
                if item.name == 'listeners':
                    qs.items.remove(item)
                    break
        else:
            listener_quota = neutron_quotas.get('listener').limit
            qs.add(base.QuotaSet({'listeners': listener_quota}))

        if 'healthmonitor' in disabled_quotas:
            for item in qs.items:
                if item.name == 'healthmonitors':
                    qs.items.remove(item)
                    break
        else:
            healthmonitor_quota = neutron_quotas.get('healthmonitor').limit
            qs.add(base.QuotaSet({'healthmonitors': healthmonitor_quota}))

        if 'pool' in disabled_quotas:
            for item in qs.items:
                if item.name == 'pools':
                    qs.items.remove(item)
                    break
        else:
            pool_quota = neutron_quotas.get('pool').limit
            qs.add(base.QuotaSet({'pools': pool_quota}))

        if 'port' in disabled_quotas:
            for item in qs.items:
                if item.name == 'ports':
                    qs.items.remove(item)
                    break
        else:
            port_quota = neutron_quotas.get('port').limit
            qs.add(base.QuotaSet({'ports': port_quota}))
    return qs

def _get_manila_quota(request, tenant_id, disabled_quotas):
    quotasets = []
    qs = base.QuotaSet()
    share_quota = manila.tenant_quota_get(request, tenant_id)
    share_quota_dict = share_quota.to_dict()
    if share_quota_dict.get('gigabytes') is not None:
        share_quota_dict['share_gigabytes'] = \
            share_quota_dict['gigabytes']
        del share_quota_dict['gigabytes']
    if share_quota_dict.get('snapshots') is not None:
        share_quota_dict['share_snapshots'] = \
            share_quota_dict['snapshots']
        del share_quota_dict['snapshots']
    quotasets.append(base.QuotaSet(share_quota_dict))
    for quota in itertools.chain(*quotasets):
        if quota.name not in disabled_quotas:
            qs[quota.name] = quota.limit
    return qs


def _get_quota_data(request, method_name, disabled_quotas=None,
                    tenant_id=None):
    quotasets = []
    if not tenant_id:
        tenant_id = request.user.tenant_id
    quotasets.append(getattr(nova, method_name)(request, tenant_id))
    qs = base.QuotaSet()
    if disabled_quotas is None:
        disabled_quotas = get_disabled_quotas(request)
    if 'volumes' not in disabled_quotas:
        quotasets.append(getattr(cinder, method_name)(request, tenant_id))
        if getattr(settings, 'MANILA_ENABLED', False):
            share_quota = getattr(manila, method_name)(request, tenant_id)
            share_quota_dict = share_quota.to_dict()
            if share_quota_dict.get('gigabytes') is not None:
                share_quota_dict['share_gigabytes'] = \
                    share_quota_dict['gigabytes']
                del share_quota_dict['gigabytes']
            if share_quota_dict.get('snapshots') is not None:
                share_quota_dict['share_snapshots'] = \
                    share_quota_dict['snapshots']
                del share_quota_dict['snapshots']
            quotasets.append(base.QuotaSet(share_quota_dict))
    for quota in itertools.chain(*quotasets):
        if quota.name not in disabled_quotas:
            qs[quota.name] = quota.limit
    return qs


@urls.register
class DefaultQuota(generic.View):
    """Get Default quota set, for restore quota and initial."""
    url_regex = r'usage/defaultquota/(?P<project_id>.+|default)/$'

    @rest_utils.ajax()
    def get(self, request, project_id):
        return _get_quota_data(request,
                               "default_quota_get",
                               tenant_id=project_id)


@urls.register
class AdminQuota(generic.View):
    """Get Default quota set, for restore quota and initial."""
    url_regex = r'usage/adminvirtualusage/$'
    _tenant_limits = []

    @rest_utils.ajax()
    def get(self, request):
        all_tenants = []
        try:
            has_more = True
            while has_more:
                tenants, has_more = keystone.tenant_list(request)
                all_tenants.extend(tenants)
        except Exception:
            exceptions.handle(self.request,
                              _('Unable to retrieve project list.'))
        try:
            for t in all_tenants:
                if t.name == 'services':
                    continue
                # Get tenant quota for each tenant
                self._each_tenant_limits = nova.tenant_absolute_limits(
                    request, reserved=True, tenant_id=t.id)
                if self._tenant_limits:
                    self._tenant_limits['maxTotalInstances'] +=\
                        (self._each_tenant_limits['maxTotalInstances'] == -1 \
                        and float('inf') or self._each_tenant_limits['maxTotalInstances'])
                    self._tenant_limits['totalInstancesUsed'] +=\
                        (self._each_tenant_limits['totalInstancesUsed'] == -1 \
                        and float('inf') or self._each_tenant_limits['totalInstancesUsed'])
                    self._tenant_limits['maxTotalRAMSize'] +=\
                        (self._each_tenant_limits['maxTotalRAMSize'] == -1 \
                        and float('inf') or self._each_tenant_limits['maxTotalRAMSize'])
                    self._tenant_limits['totalRAMUsed'] +=\
                        (self._each_tenant_limits['totalRAMUsed'] == -1 \
                        and float('inf') or self._each_tenant_limits['totalRAMUsed'])
                    self._tenant_limits['maxTotalCores'] +=\
                        (self._each_tenant_limits['maxTotalCores'] == -1 \
                        and float('inf') or self._each_tenant_limits['maxTotalCores'])
                    self._tenant_limits['totalCoresUsed'] +=\
                        (self._each_tenant_limits['totalCoresUsed'] == -1 \
                        and float('inf') or self._each_tenant_limits['totalCoresUsed'])
                else:
                    self._tenant_limits = self._each_tenant_limits

        except Exception:
            exceptions.handle(self.request,
                              _('Unable to retrieve overview list.'))

        if self._tenant_limits:
            for key, value in self._tenant_limits.items():
                if value == float('inf'):
                    self._tenant_limits[key] = "Unlimited"

            self._tenant_limits['totalInstancesUsed'] =\
                int(self._tenant_limits['totalInstancesUsed'])
        result = {}
        result['tenant_limits'] = self._tenant_limits
        return result


@urls.register
class AdminHardwareUsage(generic.View):
    """Get Default hardware quota set."""
    url_regex = r'usage/adminhardwareusage/$'

    @rest_utils.ajax()
    def get(self, request):
        hypervisor_stats = nova.hypervisor_stats(request)
        # Remove system reserved memory
        statics = hypervisor_stats.to_dict()
        if 'memory_mb_used' in statics:
            reserved_memory_mb = 0
            if settings.RESERVED_HOST_MEMORY_MB_TOTAL != -1:
                reserved_memory_mb = settings.RESERVED_HOST_MEMORY_MB_TOTAL
            else:
                reserved_memory_mb = int(statics['count']) * settings.RESERVED_HOST_MEMORY_MB
            statics['memory_mb_used'] -= reserved_memory_mb

        return {'items': statics}


@urls.register
class TenantQuota(generic.View):
    """Get Tenant quota set, for overview quota display and initial."""
    url_regex = r'usage/projectquota/(?P<project_id>.+|default)/$'

    @rest_utils.ajax()
    def get(self, request, project_id):
        # only can get string type from javascript.
        usages = []
        only_quota = request.GET.get('only_quota', 'false')
        only_quota = rest_utils.str_to_bool(only_quota)
        tenant_quota = tenant_quota_usages(request,
                                           tenant_id=project_id,
                                           only_quota=only_quota)
        for usage in tenant_quota.usages:
            usages.append({'name': usage, 'usage': tenant_quota.get(usage)})
        return {'items': usages}

@urls.register
class ComponentQuota(generic.View):
    """Get the Quota of a component."""

    url_regex = r'usage/componentquota/(?P<project_id>.+|default)/$'

    @rest_utils.ajax()
    def get(self, request, project_id):
        component_name = request.GET.get('component_name')
        only_quota = request.GET.get('only_quota', 'false')
        only_quota = rest_utils.str_to_bool(only_quota)
        component_quota_usages = QuotaUsage()
        result = []
        disabled_quotas = get_disabled_quotas(request)
        if(component_name == 'nova'):
            quota_set = _get_nova_quota(request, project_id, disabled_quotas)
            for quota in quota_set:
                component_quota_usages.add_quota(quota)
            if not only_quota:
                _get_tenant_compute_usages(request, component_quota_usages, disabled_quotas, project_id)
        if(component_name == 'neutron'):
            quota_set = _get_neutron_quota(request, project_id, disabled_quotas)
            for quota in quota_set:
                component_quota_usages.add_quota(quota)
            if not only_quota:
                _get_tenant_network_usages(request, component_quota_usages, disabled_quotas, project_id)
        if(component_name == 'cinder'):
            quota_set = _get_volume_quota(request, project_id, disabled_quotas)
            for quota in quota_set:
                component_quota_usages.add_quota(quota)
            if not only_quota:
                _get_tenant_volume_usages(request, component_quota_usages, disabled_quotas, project_id)
        for usage in component_quota_usages.usages:
            result.append({'name': usage, 'usage': component_quota_usages.get(usage)})
        return {'items': result}

@urls.register
class DomainQuota(generic.View):
    """Get Tenant quota set, for overview quota display and initial."""
    url_regex = r'usage/domainquota/(?P<domain_id>.+|default)/$'

    @rest_utils.ajax()
    def get(self, request, domain_id):
        check_tenant_unlimit = request.GET.get('check_tenant_unlimit', 'false')
        check_tenant_unlimit = rest_utils.str_to_bool(check_tenant_unlimit)
        domain_quota = domain_quota_usages(request, domain_id=domain_id)

        disabled_quotas = []
        if not getattr(settings, "OPENSTACK_NEUTRON_NETWORK", {}).get('enable_lb', False):
            disabled_quotas.extend(rest_utils.LOADBALANCER_DOMAIN_QUOTA_FIELDS)
        if not getattr(settings, 'MANILA_ENABLED', False):
            disabled_quotas.extend(rest_utils.MANILA_DOMAIN_QUOTA_FIELDS)

        domain_quota_quota = domain_quota.get('quotas')
        domain_quota_usage = domain_quota.get('usage')
        quotas = []
        for quota in domain_quota_quota:
            if quota not in disabled_quotas:
                quotas.append({'name' : quota,
                               'tenant_mapping_name' : DOMAIN_PROJ_QUOTA_MAP.get(quota, quota),
                               'usage' : {
                                   'quota' : domain_quota_quota.get(quota, 0),
                                   'used' : domain_quota_usage.get(quota, 0),
                               }
                            })

        if check_tenant_unlimit :
            quota_sum = tenant_quota_sum(request, domain_id)
            for quota in quotas :
                sum = quota_sum.get(quota['tenant_mapping_name'], 0)
                if sum == -1:
                    quota['has_unlimit'] = True
                else:
                    quota['has_unlimit'] = False

        return {'items': quotas}

@urls.register
class UpdateNoveTenantQuota(generic.View):
    url_regex = r'usage/projectquota/(?P<project_id>.+|default)/updatenovaquota$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, project_id):
        nova.tenant_quota_update(request,
                                 project_id,
                                 **request.DATA)


@urls.register
class UpdateCinderTenantQuota(generic.View):
    url_regex = r'usage/projectquota/(?P<project_id>.+|default)/updatecinderquota$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, project_id):
        cinder.tenant_quota_update(request,
                                   project_id,
                                   **request.DATA)


@urls.register
class UpdateNeutronTenantQuota(generic.View):
    url_regex = r'usage/projectquota/(?P<project_id>.+|default)/updateneutronquota$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, project_id):

        data = request.DATA
        enable_lb = getattr(settings, "OPENSTACK_NEUTRON_NETWORK", {}).get('enable_lb', False)
        if not enable_lb:
            for quota in LOADBALANCER_QUOTA_FIELDS:
                if quota in data:
                    del data[quota]

        neutron.tenant_quota_update(request,
                                    project_id,
                                    **data)


@urls.register
class UpdateManilaTenantQuota(generic.View):
    url_regex = r'usage/projectquota/(?P<project_id>.+|default)/updatemanilaquota$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, project_id):
        manila.tenant_quota_update(request,
                                    project_id,
                                    **request.DATA)

@urls.register
class UpdateDomainQuota(generic.View):
    url_regex = r'usage/domainquota/(?P<domain_id>.+|default)/updatedomainquota$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, domain_id):
        disabled_quotas = []
        if not getattr(settings, "OPENSTACK_NEUTRON_NETWORK", {}).get('enable_lb', False):
            disabled_quotas.extend(rest_utils.LOADBALANCER_DOMAIN_QUOTA_FIELDS)
        if not getattr(settings ,'MANILA_ENABLED', False):
            disabled_quotas.extend(rest_utils.MANILA_DOMAIN_QUOTA_FIELDS)

        data = request.DATA
        for quota in disabled_quotas:
            if quota in data:
                del data[quota]

        data['region'] = request.user.services_region

        keystone.domain_quota_update(request,
                                   domain_id,
                                   **data)

def get_tenant_quota_data(request, disabled_quotas=None, tenant_id=None):
    qs = _get_quota_data(request,
                         "tenant_quota_get",
                         disabled_quotas=disabled_quotas,
                         tenant_id=tenant_id)
    # TODO(jpichon): There is no API to get the default system quotas
    # in Neutron (cf. LP#1204956), so for now handle tenant quotas here.
    # This should be handled in _get_quota_data() eventually.
    if not disabled_quotas:
        return qs

    # Check if neutron is enabled by looking for network and router
    if 'network' not in disabled_quotas and 'router' not in disabled_quotas:
        tenant_id = tenant_id or request.user.tenant_id
        neutron_quotas = neutron.tenant_quota_get(request, tenant_id)
    if 'floating_ips' in disabled_quotas:
        # Neutron with quota extension disabled
        if 'floatingip' in disabled_quotas:
            qs.add(base.QuotaSet({'floating_ips': -1}))
        # Neutron with quota extension enabled
        else:
            # Rename floatingip to floating_ips since that's how it's
            # expected in some places (e.g. Security & Access' Floating IPs)
            fips_quota = neutron_quotas.get('floatingip').limit
            qs.add(base.QuotaSet({'floating_ips': fips_quota}))
    if 'security_groups' in disabled_quotas:
        if 'security_group' in disabled_quotas:
            qs.add(base.QuotaSet({'security_groups': -1}))
        # Neutron with quota extension enabled
        else:
            # Rename security_group to security_groups since that's how it's
            # expected in some places (e.g. Security & Access' Security Groups)
            sec_quota = neutron_quotas.get('security_group').limit
            qs.add(base.QuotaSet({'security_groups': sec_quota}))
    if 'network' in disabled_quotas:
        for item in qs.items:
            if item.name == 'networks':
                qs.items.remove(item)
                break
    else:
        net_quota = neutron_quotas.get('network').limit
        qs.add(base.QuotaSet({'networks': net_quota}))
    if 'subnet' in disabled_quotas:
        for item in qs.items:
            if item.name == 'subnets':
                qs.items.remove(item)
                break
    else:
        net_quota = neutron_quotas.get('subnet').limit
        qs.add(base.QuotaSet({'subnets': net_quota}))
    if 'router' in disabled_quotas:
        for item in qs.items:
            if item.name == 'routers':
                qs.items.remove(item)
                break
    else:
        router_quota = neutron_quotas.get('router').limit
        qs.add(base.QuotaSet({'routers': router_quota}))

    if not keystone.is_public_region(request):
        if 'loadbalancer' in disabled_quotas:
             for item in qs.items:
                 if item.name == 'loadbalancers':
                     qs.items.remove(item)
                     break
        else:
            loadbalancer_quota = neutron_quotas.get('loadbalancer').limit
            qs.add(base.QuotaSet({'loadbalancers': loadbalancer_quota}))

        if 'listener' in disabled_quotas:
            for item in qs.items:
                if item.name == 'listeners':
                    qs.items.remove(item)
                    break
        else:
            listener_quota = neutron_quotas.get('listener').limit
            qs.add(base.QuotaSet({'listeners': listener_quota}))

        if 'healthmonitor' in disabled_quotas:
            for item in qs.items:
                if item.name == 'healthmonitors':
                    qs.items.remove(item)
                    break
        else:
            healthmonitor_quota = neutron_quotas.get('healthmonitor').limit
            qs.add(base.QuotaSet({'healthmonitors': healthmonitor_quota}))

        if 'pool' in disabled_quotas:
            for item in qs.items:
                if item.name == 'pools':
                    qs.items.remove(item)
                    break
        else:
            pool_quota = neutron_quotas.get('pool').limit
            qs.add(base.QuotaSet({'pools': pool_quota}))
    if 'port' in disabled_quotas:
        for item in qs.items:
            if item.name == 'ports':
                qs.items.remove(item)
                break
    else:
        port_quota = neutron_quotas.get('port').limit
        qs.add(base.QuotaSet({'ports': port_quota}))
    return qs

def get_disabled_quotas(request):
    disabled_quotas = []
    # if aws_region disable network quotas, keypair quotas, snapshot quotas
    if keystone.is_public_region(request):
        disabled_quotas.extend(NEUTRON_QUOTA_FIELDS)
        disabled_quotas.extend(['key_pairs', 'snapshots', 'loadbalancer', 'pool', 'listener', 'backups'])
    # Cinder
    if not base.is_service_enabled(request, 'volume'):
        disabled_quotas.extend(CINDER_QUOTA_FIELDS)

    # Neutron
    if not getattr(settings, "OPENSTACK_NEUTRON_NETWORK", {}).get('enable_lb', False):
        disabled_quotas.extend(LOADBALANCER_QUOTA_FIELDS)
    if not base.is_service_enabled(request, 'network'):
        disabled_quotas.extend(NEUTRON_QUOTA_FIELDS)
    else:
        # Remove the nova network quotas
        disabled_quotas.extend(['floating_ips', 'fixed_ips'])

        if neutron.is_extension_supported(request, 'security-group'):
            # If Neutron security group is supported, disable Nova quotas
            disabled_quotas.extend(['security_groups', 'security_group_rules'])
        else:
            # If Nova security group is used, disable Neutron quotas
            disabled_quotas.extend(['security_group', 'security_group_rule'])

        try:
            if not neutron.is_quotas_extension_supported(request):
                disabled_quotas.extend(NEUTRON_QUOTA_FIELDS)
        except Exception:
            LOG.exception("There was an error checking if the Neutron "
                          "quotas extension is enabled.")

    return disabled_quotas


def _get_tenant_compute_usages(request, usages, disabled_quotas, tenant_id):
    if tenant_id:
        instances, has_more = nova.server_list(
            request, search_opts={'tenant_id': tenant_id})
    else:
        instances, has_more = nova.server_list(request, all_tenants=True)

    # Fetch deleted flavors if necessary.
    flavors = dict([(f.id, f) for f in nova.flavor_list(request)])
    missing_flavors = [instance.flavor['id'] for instance in instances
                       if instance.flavor['id'] not in flavors]
    for missing in missing_flavors:
        if missing not in flavors:
            try:
                flavors[missing] = nova.flavor_get(request, missing)
            except Exception:
                flavors[missing] = {}
                exceptions.handle(request, ignore=True)

    usages.tally('instances', len(instances))

    # Sum our usage based on the flavors of the instances.
    for flavor in [flavors[instance.flavor['id']] for instance in instances]:
        usages.tally('cores', getattr(flavor, 'vcpus', None))
        usages.tally('ram', getattr(flavor, 'ram', None))

    # Initialise the tally if no instances have been launched yet
    if len(instances) == 0:
        usages.tally('cores', 0)
        usages.tally('ram', 0)
    if 'key_pairs' not in disabled_quotas:
        try:
            keypairs = nova.keypair_list(request)
        except Exception:
            keypairs = []
        usages.tally('key_pairs', len(keypairs))


def _get_tenant_network_usages(request, usages, disabled_quotas, tenant_id):
    if 'floatingip' not in disabled_quotas:
        floating_ips = []
        try:
            if network.floating_ip_supported(request):
                floating_ips = network.tenant_floating_ip_list(request)
        except Exception:
            pass
        usages.tally('floating_ips', len(floating_ips))

    if 'security_group' not in disabled_quotas:
        security_groups = []
        security_groups = network.security_group_list(request)
        usages.tally('security_groups', len(security_groups))

    if 'network' not in disabled_quotas:
        networks = []
        networks = neutron.network_list(request, shared=False,
                                        tenant_id=tenant_id)
        if tenant_id:
            networks = filter(lambda net: net.tenant_id == tenant_id, networks)
        usages.tally('networks', len(networks))

    if 'subnet' not in disabled_quotas:
        subnets = []
        subnets = neutron.subnet_list(request, tenant_id=tenant_id)
        usages.tally('subnets', len(subnets))

    if 'router' not in disabled_quotas:
        routers = []
        routers = neutron.router_list(request, tenant_id=tenant_id)
        if tenant_id:
            routers = filter(lambda rou: rou.tenant_id == tenant_id, routers)
        usages.tally('routers', len(routers))

    if 'loadbalancer' not in disabled_quotas:
        loadbalancers = []
        loadbalancers = lbaasv2.list_loadbalancers_for_pool(request)
        usages.tally('loadbalancers', len(loadbalancers))

    if 'pool' not in disabled_quotas:
        pools = []
        healthmonitor_ids = []
        pools = lbaasv2.pool_list_for_quota(request)
        for pool in pools:
            if pool.get('healthmonitor_id') is not None:
                healthmonitor_ids.append(pool.get('healthmonitor_id'))
        usages.tally('healthmonitors', len(healthmonitor_ids))
        usages.tally('pools', len(pools))

    if 'listener' not in disabled_quotas:
        listeners = []
        listeners = lbaasv2.listener_list(request)
        usages.tally('listeners', len(listeners))

    if 'port' not in disabled_quotas:
        ports = []
        ports = neutron.port_list(request, tenant_id=tenant_id)
        if tenant_id:
            ports = filter(lambda port: port.tenant_id == tenant_id, ports)
        usages.tally('ports', len(ports))



def _get_tenant_volume_usages(request, usages, disabled_quotas, tenant_id):
    if 'volumes' not in disabled_quotas:
        if not tenant_id:
            opts = {'all_tenants': True}
            volumes = cinder.volume_list(request, opts)
            if 'snapshots' not in disabled_quotas:
                snapshots = cinder.volume_snapshot_list(request, opts)
            if 'backups' not in disabled_quotas:
                backups = cinder.volume_backup_list(request, opts)
        else:
            volumes = cinder.volume_list(request)
            snapshots = cinder.volume_snapshot_list(request)
            if 'backups' not in disabled_quotas:
                backups = cinder.volume_backup_list(request)
        usages.tally('gigabytes',
                     sum([int(v.size) for v in volumes]) +
                     sum([int(s.size) for s in snapshots]))
        usages.tally('volumes', len(volumes))
        if 'snapshots' not in disabled_quotas:
            usages.tally('snapshots', len(snapshots))
        if 'backups' not in disabled_quotas:
            usages.tally('backups', len(backups))
            usages.tally('backup_gigabytes', sum([int(b.size) for b in backups]))


@memoized
def tenant_quota_usages(request, tenant_id=None, only_quota=False):
    """Get our quotas and construct our usage object.
    If no tenant_id is provided, a the request.user.project_id
    is assumed to be used
    """
    if not tenant_id:
        tenant_id = request.user.project_id
    disabled_quotas = get_disabled_quotas(request)
    usages = QuotaUsage()
    for quota in get_tenant_quota_data(request,
                                       disabled_quotas=disabled_quotas,
                                       tenant_id=tenant_id):
        usages.add_quota(quota)
    if not only_quota:
        _get_tenant_compute_usages(request, usages, disabled_quotas, tenant_id)
        _get_tenant_network_usages(request, usages, disabled_quotas, tenant_id)
        _get_tenant_volume_usages(request, usages, disabled_quotas, tenant_id)
    return usages

def tenant_quota_sum(request, domain_id):
    quota_limit_sum = {}
    projects,has_more  = keystone.dedicated_tenant_list(request, domain=domain_id)
    for project in projects:
        tenant_usage = tenant_quota_usages(request, tenant_id=project.id, only_quota=True)
        for name, usage in tenant_usage.usages.iteritems():
            quota_sum = quota_limit_sum.get(name, 0)
            quota = usage.get('quota', 0)
            if quota_sum != -1 and quota != -1:
                quota_limit_sum[name] = quota_sum + quota
            else:
                quota_limit_sum[name] = -1

    return quota_limit_sum


def domain_quota_usages(request, domain_id=None):

    quotas = keystone.domain_quota_get(request,domain_id, admin=False)

    return quotas


def tenant_limit_usages(request):
    # TODO(licostan): This method shall be removed from Quota module.
    # ProjectUsage/BaseUsage maybe used instead on volume/image dashboards.
    limits = {}

    try:
        limits.update(nova.tenant_absolute_limits(request))
    except Exception:
        msg = _("Unable to retrieve compute limit information.")
        exceptions.handle(request, msg)

    if base.is_service_enabled(request, 'volume'):
        try:
            limits.update(cinder.tenant_absolute_limits(request))
            volumes = cinder.volume_list(request)
            snapshots = cinder.volume_snapshot_list(request)
            total_size = sum([getattr(volume, 'size', 0) for volume
                              in volumes])
            limits['gigabytesUsed'] = total_size
            limits['volumesUsed'] = len(volumes)
            limits['snapshotsUsed'] = len(snapshots)
        except Exception:
            msg = _("Unable to retrieve volume limit information.")
            exceptions.handle(request, msg)

    return limits


@memoized
def tenant_exist_ress(request, tenant_id=None, check_ress=None):
    """Get our quotas and construct our usage object.
    If no tenant_id is provided, a the request.user.project_id
    is assumed to be used
    """
    if not tenant_id:
        tenant_id = request.user.project_id
    if check_ress is None:
        """
        { 'metadata_items': {'quota': 1024},
          'subnets': {'available': 50, 'used': 0, 'quota': 50},
          'injected_files': {'quota': 5},
          'gigabytes': {'available': 949, 'used': 51, 'quota': 1000},
          'routers': {'available': 50, 'used': 0, 'quota': 50},
          'ram': {'available': 48641, 'used': 2560, 'quota': 51201},
          'key_pairs': {'available': 10, 'used': 0, 'quota': 10},
          'instances': {'available': 96, 'used': 5, 'quota': 101},
          'snapshots': {'available': 10, 'used': 0, 'quota': 10},
          'networks': {'available': 3, 'used': 0, 'quota': 3},
          'security_groups': {'available': 0, 'used': 1, 'quota': -1},
          'injected_file_content_bytes': {'quota': 10240},
          'floating_ips': {'available': 250, 'used': 0, 'quota': 250},
          'volumes': {'available': 8, 'used': 2, 'quota': 10},
          'cores': {'available': 96, 'used': 5, 'quota': 101},
          'injected_file_path_bytes': {'quota': 255}
        }
        """
        check_ress = ["instances", "volumes", "snapshots",
                      "routers", "floating_ips"]

    tenant_usage = tenant_quota_usages(request,
                                       tenant_id=tenant_id,
                                       only_quota=False)
    for (name, usage) in tenant_usage.usages.iteritems():
        if name in check_ress and usage.get("used", 0) > 0:
            return True
    return False
