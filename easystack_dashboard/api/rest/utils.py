# Copyright 2014, Rackspace, US, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
import functools
import json
import logging

from django.conf import settings
from django import http
from django.utils.datastructures import SortedDict  # noqa
from django.utils import decorators
from django.utils import encoding
from django.utils.translation import ugettext_lazy as _

from oslo_serialization import jsonutils

from easystack_dashboard import api
from easystack_dashboard.openstack.common import timeutils
from horizon import exceptions

log = logging.getLogger(__name__)


class AjaxError(Exception):
    def __init__(self, http_status, msg):
        self.http_status = http_status
        super(AjaxError, self).__init__(msg)


http_errors = exceptions.UNAUTHORIZED + exceptions.NOT_FOUND + \
              exceptions.RECOVERABLE + (AjaxError, exceptions.HorizonException)


class CreatedResponse(http.HttpResponse):
    def __init__(self, location, data=None):
        if data is not None:
            content = jsonutils.dumps(data, sort_keys=settings.DEBUG)
            content_type = 'application/json'
        else:
            content = ''
            content_type = None
        super(CreatedResponse, self).__init__(status=201, content=content,
                                              content_type=content_type)
        self['Location'] = location


class JSONResponse(http.HttpResponse):
    def __init__(self, data, status=200):
        if status == 204:
            content = ''
        else:
            content = jsonutils.dumps(data, sort_keys=settings.DEBUG)

        super(JSONResponse, self).__init__(
            status=status,
            content=content,
            content_type='application/json',
        )


def str_to_bool(str):
    return str and str.lower() == 'true'


def ajax(authenticated=True, data_required=False):
    '''Provide a decorator to wrap a view method so that it may exist in an
    entirely AJAX environment:

    - data decoded from JSON as input and data coded as JSON as output
    - result status is coded in the HTTP status code; any non-2xx response
      data will be coded as a JSON string, otherwise the response type (always
      JSON) is specific to the method called.

    if authenticated is true then we'll make sure the current user is
    authenticated.

    If data_required is true then we'll assert that there is a JSON body
    present.

    The wrapped view method should return either:

    - JSON serialisable data
    - an object of the django http.HttpResponse subclass (one of JSONResponse
      or CreatedResponse is suggested)
    - nothing

    Methods returning nothing (or None explicitly) will result in a 204 "NO
    CONTENT" being returned to the caller.
    '''

    def decorator(function, authenticated=authenticated,
                  data_required=data_required):
        @functools.wraps(function,
                         assigned=decorators.available_attrs(function))
        def _wrapped(self, request, *args, **kw):
            if authenticated and not request.user.is_authenticated():
                return JSONResponse('Session expired', 401)
            if not request.is_ajax():
                return JSONResponse('request must be AJAX', 400)

            # decode the JSON body if present
            request.DATA = None
            if request.body:
                try:
                    request.DATA = json.loads(request.body)
                except (TypeError, ValueError) as e:
                    return JSONResponse('malformed JSON request: %s' % e, 400)

            if data_required:
                if not request.DATA:
                    return JSONResponse('request requires JSON body', 400)

            # invoke the wrapped function, handling exceptions sanely
            try:
                data = function(self, request, *args, **kw)
                if isinstance(data, http.HttpResponse):
                    return data
                elif data is None:
                    return JSONResponse('', status=204)
                return JSONResponse(data)
            except http_errors as e:
                # NOTE(lzm): because the exception message's type maybe
                # not str(may unicode or utf8...), so using smart_text
                msg = encoding.smart_text(e)
                # exception was raised with a specific HTTP status
                if hasattr(e, 'http_status'):
                    http_status = e.http_status
                elif hasattr(e, 'code'):
                    http_status = e.code
                elif hasattr(e, 'status_code'):
                    http_status = e.status_code
                else:
                    log.exception('HTTP exception with no status/code')
                    return http.HttpResponse(msg, status=500)
                return http.HttpResponse(msg, status=http_status)
            except Exception as e:
                log.exception('error invoking apiclient')
                return http.HttpResponse(encoding.smart_text(e), status=500)

        return _wrapped

    return decorator


def params_from_request(request):
    params = request.DATA or request.GET or request.POST
    if params is None:
        params = {}
    return params


def parse_args(request, needed_params=None):
    """Extract REST filter parameters from the request GET args.
    """
    args = []
    try:
        params = params_from_request(request)
        for needed_param in needed_params:
            args.append(params[needed_param])
    except KeyError as e:
        raise AjaxError(400, "missing required parameter '%s'" % e.args[0])
    return args


def parse_filters_kwargs(request, client_keywords={}):
    """Extract REST filter parameters from the request GET args.

    Client processes some keywords separately from filters and takes
    them as separate inputs. This will ignore those keys to avoid
    potential conflicts.
    """
    params = params_from_request(request)
    filters = {}
    kwargs = {}
    for param in params:
        if param in client_keywords:
            kwargs[param] = params[param]
        else:
            filters[param] = params[param]
    return filters, kwargs


def check_id_exist(key):
    """ Check that if key 'id' in the client response dic data,
    If not add a new pair {'id': value}. The value is item id value
    such as "alarm_id", "meter_id" which should be passed as argument.
    """

    def wrapper(func):
        def inner(*args, **kwargs):
            items = func(*args, **kwargs).get('items')
            for item in items:
                if not item.has_key('id') or item['id'] == None:
                    item.update({'id': item[key]})
            return {'items': items}

        return inner

    return wrapper


def get_image_type(image):
    properties = getattr(image, "properties", {})
    result = properties.get("image_id", None)
    if result is None:
        result = properties.get("image_type", "image")
    else:
        result = "snapshot"
    return result


def get_image_instance_uuid(image):
    return getattr(image, "properties", {}).get("instance_uuid", "NotFound")


def ensure_shared_network_name(request, share):
    try:
        shared_network = api.manila.share_network_get(
            request, share.get('share_network_id'))
    except Exception:
        return share

    if shared_network is not None:
        share.update({'share_network_name': shared_network.name})

    return share


def ensure_remote_group_name(request, sg):
    security_groups = api.network.security_group_list(request)
    # add remote_group_name for rules with remote_group_id
    sgs_dict = SortedDict([(s.id, s.name) for s in security_groups])
    for rule in sg['security_group_rules']:
        rule['remote_group_name'] = sgs_dict.get(rule['remote_group_id'], None)


def ensure_tenant_name_in_usages(request, result):
    try:
        tenants, has_more = api.keystone.tenant_list(request)
    except Exception:
        tenants = []
        return
    tenant_dict = SortedDict([(t.id, t) for t in tenants])
    for item in result:
        tenant = tenant_dict.get(item.tenant_id, None)
        if tenant:
            item.tenant_name = tenant.name
            item.domain_id = tenant.domain_id
        else:
            item.tenant_name = item.tenant_id + '(deleted)'
            item.domain_id = 'deleted'


def ensure_neutron_sub_and_network_name(request, result):
    try:
        networks = api.neutron.network_list(request)
    except Exception:
        networks = []
        return

    network_dict = SortedDict([(n.id, n) for n in networks])

    for item in result:
        network = network_dict.get(item.get('neutron_net_id'), None)
        if network:
            item['neutron_net_name'] = network.get('name')
        else:
            item['neutron_net_name'] = 'No Network'

        subnets = network.get('subnets') if network else None
        if subnets:
            subnet_dict = SortedDict([s.id, s] for s in subnets)
            subnet = subnet_dict.get(item.get('neutron_subnet_id'), None)
            if subnet:
                item['neutron_subnet_name'] = subnet.get('name')
            else:
                item['neutron_subnet_name'] = 'No Sub Network'
        else:
            item['neutron_subnet_name'] = 'No Sub Network'

    return result


def ensure_neutron_parent_network_name(request, result):
    try:
        networks = api.neutron.network_list(request)
    except Exception:
        networks = []
        return

    network_dict = SortedDict([(n.id, n) for n in networks])
    for item in result:
        network = network_dict.get(item.get('network_id'), None)
        if network:
            item.update({'network': network.name})


def ensure_network_detial_for_subnet(request, result):
    try:
        networks = api.neutron.network_list(request)
    except Exception:
        networks = []
        return
    network_dict = SortedDict([(n.id, n) for n in networks])
    for item in result:
        network = network_dict.get(item.get('network_id'), None)
        if network:
            item.update({'network_router_extenal': network.router__external,
                         'network_name': network.name,
                         'network_shared': network.shared
                         })
    return result


def ensure_tenant_name(request, result, tenant_id_str='tenant_id', tenant_name_key='tenant_name'):
    """ Check the resource if has attribute tenant_name.
        we need items have tenant_id orproject_id attribute
        we usually use this method in admin tables.
    """
    try:
        tenants, has_more = api.keystone.tenant_list(request)
    except Exception:
        tenants = []
        return
    tenant_dict = SortedDict([(t.id, t) for t in tenants])
    for item in result:
        if hasattr(item, tenant_id_str) and not hasattr(item, tenant_name_key):
            tenant = tenant_dict.get(getattr(item, tenant_id_str), None)
            item.tenant_name = getattr(tenant, "name", None)
            item.domain_id = getattr(tenant, "domain_id", None)


def ensure_volume_name(request, result, volume_id_str='volume_id', volume_name_str='volume_name'):
    """ Check the resource if has attribute volume_name.
        we need items have tenant_id orproject_id attribute
        we usually use this method in admin tables.
    """
    try:
        volumes = api.cinder.volume_list(request)
    except Exception:
        volumes = []
        return
    volume_dict = SortedDict([(v.id, v) for v in volumes])
    for item in result:
        if hasattr(item, volume_id_str) and not hasattr(item, volume_name_str):
            volume = volume_dict.get(getattr(item, volume_id_str), None)
            item.volume_name = getattr(volume, "name", None)
            item._apiresource.volume_name = getattr(volume, "name", None)
            item._apiresource._info[u'volume_name'] = getattr(volume, "name", None)


def ensure_domain_name(request, result):
    try:
        domains = api.keystone.domain_list(request)
    except Exception:
        domains = []
        return result
    domain_dict = SortedDict([(d.id, d) for d in domains])
    for item in result:
        if item['domain_id'] == 'deleted':
            item.update({'domain': 'Deleted'})
        else:
            domain = domain_dict.get(item['domain_id'], None)
            if domain:
                item.update({'domain': domain.name})

    return result


def ensure_firewall_id_in_routers(reqeust, result):
    try:
        firewalls = api.fwaas.firewall_list(reqeust)
    except Exception:
        firewalls = []

    for item in result:
        item.update({'firewall_id': ''})
        for firewall in firewalls:
            if firewall.router_ids:
                if item.get('id') in firewall.router_ids:
                    item.update({'firewall_id': firewall.id})
                    item.update({'firewall_name': firewall.name})
                    break
    return result


def ensure_is_domain_admin(request, users):
    for user in users:
        domain = user.get('domain_id')
        # get the user role to ensure role
        domain_admin = (True if user.get('user_role') == 'domain_admin'
                        else False)
        # if not, get the role from keystone api.
        # If the new registered user has not been activated, role from
        # keystone client will be none, while the user_role
        # is domain_admin.
        if not domain_admin:
            domain_admin = (api.keystone.user_is_domain_admin(
                request, user['id'], domain) if domain else False)
        user['is_domain_admin'] = domain_admin
    return users


def ensure_has_snapshot(request, result):
    """ Check the instance if has attribute has_snapshot.
        we usually forbidden rebuid when instance has snapshot.
    """
    try:
        images, has_more_data, has_prev_data = api.glance.image_list_detailed(
            request)
        snapshots = [i for i in images if get_image_type(i) == 'snapshot']
    except Exception:
        return
    snapshot_dict = SortedDict(
        [(get_image_instance_uuid(i), True) for i in snapshots])
    for item in result:
        item.has_snapshot = snapshot_dict.get(item.id, False)


def ensure_all_flavor(request, result):
    """ add flavor information."""
    try:
        flavors = api.nova.flavor_list(request, is_public=True)
        flavors.extend(api.nova.flavor_list(request, is_public=False))
    except Exception:
        flavors = []
        return
    flavor_dict = SortedDict([(t.id, t) for t in flavors])

    for item in result:
        flavor = flavor_dict.get(item.get('flavor', {}).get('id'))
        if flavor:
            item.update({'flavor': flavor.to_dict()})
    return result


def ensure_billing_flavors(request, result):
    for item in result:
        rule = item['rule']
        if rule is None or item['ptype'] != 'instance':
            continue
        if type(rule) == dict:
            flavor_id = rule.get('flavor') or rule.get('flavor_id')
        else:
            rule = eval(rule)
            flavor_id = rule.get('flavor') or rule.get('flavor_id')
        item.update({'flavor': {'id': flavor_id}})
    return ensure_all_flavor(request, result)


def ensure_billing_rule_dscrs(request, result):
    def _cpu2str(core):
        return _('%(core)d%(str)s') % {'core':core, 'str':_('C')}

    def _mb2str(mb):
        if mb >= 1024:
            return _('%dGB') % (mb / 1024)
        else:
            return _('%dMB') % mb

    def _gb2str(gb):
        if gb >= 1024:
            return _('%dTB') % (gb / 1024)
        else:
            return _('%dGB') % gb

    def _ptype2str(ptype):
        ptype_map = {}
        ptype_map['image'] = 'Instance Snapshot'
        ptype_map['snapshot'] = 'Volume Snapshot'
        ptype_map['backup'] = 'Volume Backup'
        ptype_map['floatingip'] = 'Floating IP'
        ptype_map['backup-full'] = 'Backup Full'
        ptype_map['backup-increment'] = 'Backup Increment'

        return ptype_map[ptype] if ptype in ptype_map else ptype.title()

    def _rule_dscription(item):
        # instance,image,volume,floatingip,snapshot
        rules = {}
        # rules['instance'] = lambda: _('The Price of a Instance with '
        #                               'CPU %s RAM %s Disk %s') % (
        #     _cpu2str(item['flavor']['vcpus']),
        #     _mb2str(item['flavor']['ram']),
        #     _gb2str(item['flavor']['disk']))
        # rules['floatingip'] = lambda: _('The Price per %s of a Floating IP\'s '
        #                                 'Bandwidth') % _('Mb')
        # rules['volume'] = lambda: _('The Price per %s of a Volume') % _('GB')
        # rules['default'] = _('The Price of a %s') % _(
        #     _ptype2str(item['ptype']))
        rules['instance'] = _('The Price of a Instance with CPU %(vcpus)s RAM %(ram)s Disk %(disk)s') % {
            'vcpus': _cpu2str(item['flavor']['vcpus']), 'ram': _mb2str(item['flavor']['ram']),
            'disk': _gb2str(item['flavor']['disk'])}
        rules['floatingip'] = _('The Price per %s of a Floating IP\'s Bandwidth') % _('Mb')
        rules['volume'] = _('The Price per %s of a Volume') % _('GB')
        rules['default'] = _('The Price of a %s') % _(_ptype2str(item['ptype']))

        ptype = item['ptype']
        return rules[ptype] if ptype in rules else rules['default']

    for item in result:
        try:
            if item['ptype'] == 'lbaas':
                item['ptype'] = 'listener'
            rule_dscription = _rule_dscription(item)
            item.update({'rule_dscription': rule_dscription})
        except Exception as e:
            log.exception(e)
            continue
    return result


def ensure_pools_name(request, result):
    try:
        pools = api.network.floating_ip_pools_list(request)
    except Exception as e:
        pools = []
    pools_dict = SortedDict([(p.id, p) for p in pools])

    for item in result:
        pool = pools_dict.get(item.get('pool'))
        if pool:
            item.update({'pool': pool.to_dict()})
    return result


def ensure_pool_name(request, result):
    try:
        pool = api.network.floating_ip_pool_get(request, result['pool'])
        result.update({'pool': pool.to_dict()})
    except Exception as e:
        pass
    return result


def ensure_volume_name_and_type(request, result):
    try:
        volumes = api.cinder.volume_list(
            request, parse_filters_kwargs(request)[0])
    except Exception as e:
        volumes = []
    volumes_dict = SortedDict([(v.id, v) for v in volumes])

    for item in result:
        volume = volumes_dict.get(item.get('volume_id'))
        if volume:
            item.update({'volume_name': volume.name,
                         'volume_type': volume.volume_type})
    return result


def ensure_instances_details(request, result):
    try:
        servers, has_more = api.nova.server_list(request)
    except Exception:
        servers = []

    servers_dict = SortedDict([(s.id, s) for s in servers])
    try:
        routers = api.neutron.router_list(request)
        loadbalancers = api.lbaasv2.list_loadbalancers_for_pool(request)
    except Exception:
        routers = []
        loadbalancers = []
    routers_dict = SortedDict([(r.id, r) for r in routers])
    loadbalancers_dict = SortedDict([(s.get('id'), s) for s in loadbalancers])

    for item in result:
        if item['instance_type'] is None:
            item['instance'] = None
        elif item['instance_type'] == 'compute' and item['instance_id']:
            server = servers_dict.get(item['instance_id'])
            if server:
                item['instance_name'] = server.name
                item['instance_type'] = 'Instance'
        elif item['instance_type'] == 'router' and item['instance_id']:
            router = routers_dict.get(item['instance_id'])
            if router:
                item['instance_name'] = router.name
                item['instance_type'] = 'Router'
        elif item['instance_type'] == 'loadbalancer' and item['instance_id']:
            loadbalancer = loadbalancers_dict.get(item['instance_id'])
            if loadbalancer:
                item.update({'instance_name': loadbalancer.get('name')})
                item['instance_type'] = 'Loadbalancer'
    return result


def ensure_instances_detail_in_snapshot(request, result, **filters):
    try:
        v3, domain_admin = api.keystone.is_domain_admin(request)
        servers, has_more = api.nova.server_list(request,
                                                 all_tenants=domain_admin)
    except Exception:
        servers = []

    servers_dict = SortedDict([(s.id, s) for s in servers])
    inuse_image_list = [s.image['id'] for s in servers
                        if s.image and s.image.has_key('id')]
    for item in result:
        if item.properties.has_key('instance_uuid') \
                and not hasattr(item, 'instance_name'):
            server = servers_dict.get(
                item.properties.get('instance_uuid'), None)
            item.instance_name = getattr(server, "name", None)
        if item.properties.get("block_device_mapping"):
            item.instance_name = get_instance_name(request, item)
        if item.id in inuse_image_list:
            item.in_use = True
        else:
            item.in_use = False
    return result


def ensure_subnets_detail_in_loadbalancer(request, result):
    try:
        subnets = api.neutron.subnet_list(request)
    except Exception:
        subnets = []
    subnets_dicts = SortedDict([(s.id, s) for s in subnets])
    for item in result:
        subnetCidr = subnets_dicts.get(item.get('vip_subnet_id')).get('cidr')
        item.update({'subnet': subnetCidr})
    return result


def ensure_fixed_ip_for_ports(request, result):
    try:
        subnets = api.neutron.subnet_list(request)
        security_groups = api.network.security_group_list(request)
    except Exception:
        subnets = []
        security_groups = []
    subnets_dicts = SortedDict([(s.id, s) for s in subnets])
    security_groups_dicts = SortedDict([(s.id, s) for s in security_groups])
    for item in result:
        security_groups_array = []
        subnet_name = ''
        if len(item.get('fixed_ips')) != 0:
            subnet_id = item.get('fixed_ips')[0].get('subnet_id')
            if subnet_id:
                subnet = subnets_dicts.get(subnet_id)
                if subnet:
                    subnet_name = subnet.get('name')
        for sg_id in item.get('security_groups'):
            security_group = security_groups_dicts.get(sg_id)
            if security_group:
                security_groups_array.append(security_group.to_dict())
        item.update({'subnet_name': subnet_name, 'security_groups_array': security_groups_array})
    return result


def ensure_floatingip_instance_for_port(request, result):
    try:
        floatingips = [floatingip for floatingip in api.network.tenant_floating_ip_list(request) \
                       if floatingip.port_id is not None]
        instances = api.nova.server_list(request, all_tenants=request.GET.get('retrieve_all', False))[0]
    except Exception:
        floatingips = []
        instances = []
    instances_dict = SortedDict([(s.id, s) for s in instances])

    for item in result:
        floating_ip_addr = None
        instance_name = None
        instance = instances_dict.get(item.get('device_id'))
        if instance is not None:
            instance_name = instance.name
        associated_ip = next((fip for fip in floatingips
                              if fip['port_id'] == item['id']), None)
        if associated_ip is not None:
            floating_ip_addr = associated_ip['ip']
        item.update({'instance_name': instance_name, 'floatingip': floating_ip_addr})
    return result


def ensure_router_for_port(request, result):
    try:
        routers = api.neutron.router_list(request)
    except Exception:
        routers = []
    routers_dict = SortedDict([(s.id, s) for s in routers])

    for item in result:
        if item.get('device_owner') and item.get('device_owner').startswith('network:router_interface'):
            device_name = None
            router = routers_dict.get(item.get('device_id'))
            if router is not None:
                device_name = router.name
            item.update({'device_name': device_name})
    return result


def ensure_loadbalance_for_port(request, result):
    if not getattr(settings, "OPENSTACK_NEUTRON_NETWORK", {}).get('enable_lb', False):
        return result
    try:
        if request.GET.get('retrieve_all', False):
            loadbalances = api.lbaasv2.list_loadbalancers_for_all(request)
        else:
            loadbalances = api.lbaasv2.list_loadbalancers_for_pool(request)
    except Exception as e:
        print e
        loadbalances = []
    loadbalances_dict = SortedDict([(s.get('id'), s) for s in loadbalances])

    for item in result:
        if item.get('device_owner') and item.get('device_owner').startswith('neutron:LOADBALANCER'):
            device_name = None
            loadbalance = loadbalances_dict.get(item.get('device_id'))
            if loadbalance is not None:
                device_name = loadbalance.get('name')
            item.update({'device_name': device_name})
    return result


def ensure_qos_policy_in_port(request, result):
    for port in result:
        qos_policy_id = port.get('qos_policy_id')
        if qos_policy_id:
            bind_width_limits = api.neutron.bandwidth_limit_rules_list(request, qos_policy_id)
            if len(bind_width_limits) > 0:
                if bind_width_limits[0].max_kbps:
                    max_mbps = bind_width_limits[0].max_kbps / 1024
                    port.update({'max_mbps': max_mbps,
                                 'bind_width_limit_id': bind_width_limits[0].id})
    return result


def ensure_qos_policy_rule(request, result):
    for qos_policy in result:
        bind_width_limits = api.neutron.bandwidth_limit_rules_list(request,
                                                                   qos_policy.get('id'))
        if len(bind_width_limits) > 0:
            if bind_width_limits[0].max_kbps:
                max_mbps = bind_width_limits[0].max_kbps / 1024
                qos_policy.update({'max_mbps': max_mbps,
                                   'bind_width_limit_id': bind_width_limits[0].id})

    return result


def ensure_security_name_in_loadbalancer(request, result):
    try:
        security_groups = api.network.security_group_list(request)
    except Exception:
        security_groups = []
    security_groups_dicts = SortedDict([(s.id, s) for s in security_groups])
    for item in result:
        port = api.neutron.port_get(request, item.get('vip_port_id')).to_dict()
        security_groups_name = security_groups_dicts.get(port.get("security_groups")[0]).get('name')
        security_groups_id = security_groups_dicts.get(port.get("security_groups")[0]).get('id')
        item.update({'security_groups_name': security_groups_name})
        item.update({'security_groups_id': security_groups_id})
    return result


def ensure_subnets_and_lb_detail_in_pool(request, result):
    tenant_id = request.user.project_id
    kwargs = {
        'tenant_id': tenant_id
    }
    try:
        listeners = api.lbaasv2.listener_list(request)
        loadbalancers = api.lbaasv2.list_loadbalancers_for_pool(request)
        subnets = api.neutron.subnet_list(request)
        networks = api.neutron.network_list(request)
    except Exception:
        listeners = []
        loadbalancers = []
        subnets = []
        networks = []
    subnets_dicts = SortedDict([(s.id, s) for s in subnets])
    loadbalancers_dicts = SortedDict([(s.get('id'), s) for s in loadbalancers])
    listeners_dicts = SortedDict([(s.get('id'), s) for s in listeners])
    networks_dicts = SortedDict([(n.get('id'), n) for n in networks])
    for item in result:
        listeners_id = item.get('listeners')[0].get('id')
        listener = listeners_dicts.get(listeners_id)
        loadbalancer = loadbalancers_dicts.get(listener.get('loadbalancers')[0].get('id'))
        subnet_id = loadbalancer.get('vip_subnet_id')
        subnet = subnets_dicts.get(subnet_id)
        network_id = subnet.get('network_id')
        network = networks_dicts.get(network_id)
        item.update({
            'loadbalancer_name': loadbalancer.get('name'),
            'listener_name': listener.get('name'),
            'subnet_name': subnet.name,
            'subnet_cidr': subnet.cidr,
            'subnet_id': subnet.id,
            'network_name': network.name,
        })
    return result


def ensure_instances_detail_in_member(request, result):
    try:
        servers = api.nova.server_list(request)[0]
    except Exception:
        servers = []
    for item in result:
        member_address = item.get('address')
        for server in servers:
            ips = server.addresses.values()
            for ip in ips:
                if (ip[0].get('addr') == member_address):
                    item.update({
                        'instance_name': server.name,
                        'instance_status': server.status,
                        'instance_id': server.id,
                    })
    return result


def get_instance_name(request, item):
    try:
        snapshot_id = json.loads(
            item.properties.get("block_device_mapping"))[0].get("snapshot_id")
        volume_id = api.cinder.volume_snapshot_get(
            request, snapshot_id).volume_id
        volume = api.cinder.volume_get(request, volume_id).to_dict()
        name = volume.get('attachments')[0].get('instance_name')
    except Exception as e:
        log.exception(e)
        return None
    return name


def ensure_instance_details(request, result):
    if result['instance_type'] is None:
        result['instance'] = None
    elif result['instance_type'] == 'compute' and result['instance_id']:
        server = api.nova.server_get(request, result['instance_id'])
        if server:
            result['instance_name'] = server.name
            result['instance_type'] = "Instance"
    elif result['instance_type'] == 'router' and result['instance_id']:
        router = api.neutron.router_get(request, result['instance_id'])
        if router:
            result['instance_name'] = router.name
            result['instance_type'] = "Router"

    return result


def ensure_image_name(request, result, image_id_str='id'):
    """ Check the resource if has attribute image_name.
        we need items have image_id orproject_id attribute.
    """
    try:
        images, has_more_data, has_prev_data = api.glance.image_list_detailed(
            request,
        )
    except Exception:
        images = []
        return
    images_dict = SortedDict([(t.id, t) for t in images])
    for item in result:
        """In case that instance booted from volume
        has no images information """
        if item.image:
            if item.image.has_key(image_id_str) and \
                    not hasattr(item, 'image_display_name'):
                image = images_dict.get(item.image.get(image_id_str), None)
                # this is to manage the v2.0 glance image properties
                if image is not None:
                    item.image['properties'] = ensure_image_prop_dict(getattr(image, 'properties'))
                    item.image_display_name = getattr(image, "name", None)


# this util is to manage the image prop
# it is only to glance V2.0 because the v1 is different from v2
def ensure_image_prop_dict(dictObj):
    if ('direct_url' in dictObj):
        dictObj.pop('direct_url')
    return dictObj


def ensure_single_image_name(request, result):
    """ Check the resource if has attribute image_name.
    """
    if result['image'] and 'id' in result['image']:
        image = api.glance.image_get(request, result['image']['id'])
        if image:
            result['image_display_name'] = image.name


def ensure_address_format(request, result):
    for item in result:
        ip_groups = {}
        for ip_group, addresses in item.addresses.iteritems():
            ip_groups[ip_group] = {}
            ip_groups[ip_group]["floating"] = []
            ip_groups[ip_group]["non_floating"] = []
            for address in addresses:
                if ('OS-EXT-IPS:type' in address and
                            address['OS-EXT-IPS:type'] == "floating"):
                    ip_groups[ip_group]["floating"].append(address)
                else:
                    ip_groups[ip_group]["non_floating"].append(address)
        if not hasattr(item, 'ip_groups') and ip_groups:
            item.ip_groups = ip_groups


def ensure_single_address_format(request, result):
    ip_groups = {}
    for ip_group, addresses in result['addresses'].iteritems():
        ip_groups[ip_group] = {}
        ip_groups[ip_group]["floating"] = []
        ip_groups[ip_group]["non_floating"] = []
        for address in addresses:
            if ('OS-EXT-IPS:type' in address and
                        address['OS-EXT-IPS:type'] == "floating"):
                ip_groups[ip_group]["floating"].append(address)
            else:
                ip_groups[ip_group]["non_floating"].append(address)
    if ip_groups:
        result['ip_groups'] = ip_groups


def ensure_single_flavor(request, result):
    """ add flavor information."""
    try:
        flavor = api.nova.flavor_get(request, result['flavor']['id'])
        result['flavor'] = flavor.to_dict()
    except Exception:
        return


def ensure_single_volumes(request, result):
    """ ensure instance attach volumes """
    volumes = []
    for item in result['os-extended-volumes:volumes_attached']:
        if item.get('id') is not None:
            try:
                volume = api.cinder.volume_get(request, item.get('id'))
                volumes.append(volume.to_dict())
            except Exception:
                pass
    result['volumes_details'] = volumes


def ensure_up_time(request, result):
    """ add flavor information."""
    launched = result.get('OS-SRV-USG:launched_at')
    if launched is not None:
        current_time = timeutils.utcnow()
        launch_time = timeutils.parse_isotime(launched)

        if not hasattr(result, 'uptime'):
            # replace a utc time from native time.
            launch_time = launch_time.replace(tzinfo=None)
            result['uptime'] = str(current_time - launch_time)


def ensure_security_group(request, result):
    """ add flavor information."""
    security_groups = \
        api.network.server_security_groups(request, result.id)
    security_groups_str = ''
    for group in security_groups:
        security_groups_str += getattr(group, "name", '') + '\n'
    if not hasattr(result, 'security_groups'):
        result.security_groups = security_groups_str


def ensure_image_volume_id(request, result):
    """ add volume id to image """
    try:
        volumes = api.cinder.volume_list(request)
    except Exception:
        volumes = []

    volumes_dict = {}
    for v in volumes:
        try:
            if 'image_id' in getattr(v, 'volume_image_metadata'):
                volumes_dict[v.volume_image_metadata['image_id']] = v
        except Exception:
            pass
    volumes_dict = SortedDict(volumes_dict)

    for item in result:
        if item.id in volumes_dict:
            item.volume_id = volumes_dict[item.id].id

    return result


def ensure_subnet_with_router(request, result):
    # we get all the ports that has a router connected to it here.
    ports = api.neutron.port_list(request,
                                  device_owner='network:router_interface')
    subnet_id_set = set()
    for port in ports:
        if hasattr(port, 'fixed_ips') and len(getattr(port, 'fixed_ips')) > 0:
            for fixed_ip in port.get('fixed_ips'):
                subnet_id = fixed_ip.get('subnet_id')
                subnet_id_set.add(subnet_id)

    new_result = []
    for subnet in result:
        if subnet.get('id') in subnet_id_set \
                and hasattr(subnet, 'gateway_ip') \
                and subnet.get('gateway_ip') is not None:
            new_result.append(subnet)

    return new_result


def admin_add_tenant_name(all_projects='all_projects',
                          tenant_col='tenant_id',
                          items_name='items'):
    """Add tenant_name to item if need
    @param all_projects: the name to tag if we need all the tenants
    @param tenant_col: the name of tenant_id
    """

    def _get_all_tenants(request):
        all_tenants = []
        try:
            has_more = True
            while has_more:
                tenants, has_more = api.keystone.tenant_list(request)
                all_tenants.extend(tenants)
        except Exception:
            pass
        tenant_dict = SortedDict([(t.id, t) for t in all_tenants])
        return tenant_dict

    def _update_tenant_name(items, tenant_dict):
        for item in items:
            if tenant_col in item and not item.get('tenant_name'):
                tenant_id = item[tenant_col]
                tenant = tenant_dict.get(tenant_id, None)
                tenant_name = tenant.name if tenant else tenant_id
                domain_id = tenant.domain_id if tenant else None
                item.update({'tenant_name': tenant_name})
                item.update({'domain_id': domain_id})
        return items

    def wrapper(func):
        def inner(self, request, *args, **kwargs):
            # check if we need tenant_name
            need_tenant_name = False
            if all_projects in request.GET:
                need_tenant_name = str_to_bool(request.GET[all_projects])
            # do request
            result = func(self, request)
            # if we need tenant_name,update it
            if need_tenant_name:
                items = result[items_name] if items_name else [result]
                tenants = _get_all_tenants(request)
                _update_tenant_name(items, tenants)
                ensure_domain_name(request, items)
            return result

        return inner

    return wrapper


def patch_items_by_func(patch_func):
    def wrapper(func):
        def inner(self, request, *args, **kwargs):
            # do request
            result = func(self, request, *args, **kwargs)
            # patch it
            if 'items' in result:
                result['items'] = patch_func(request, result['items'])
            return result

        return inner

    return wrapper


def patch_item_by_func(patch_func):
    def wrapper(func):
        def inner(self, request, *args, **kwargs):
            # do request
            result = func(self, request, *args, **kwargs)
            # patch it
            result = patch_func(request, result)
            return result

        return inner

    return wrapper


def get_ticket_status_name_id_map(request):
    name_id_map = {}
    result = api.ticket.status_list(request)
    for status in result:
        name_id_map[status.get('name')] = status.get('id')

    return name_id_map


def get_ticket_status_id_name_map(request):
    id_name_map = {}
    result = api.ticket.status_list(request)
    for status in result:
        id_name_map[status.get('id')] = status.get('name')

    return id_name_map


def get_ticket_type_id_name_map(request):
    id_name_map = {}
    result = api.ticket.type_list(request)
    for type in result:
        id_name_map[type.get('id')] = type.get('name')

    return id_name_map


def ensure_ticket_status_name(request, *tickets):
    if len(tickets) == 0:
        return
    id_name_map = get_ticket_status_id_name_map(request)
    for ticket in tickets:
        ticket["status_name"] = id_name_map.get(ticket.get('status_id', None), None)


def ensure_ticket_type_name(request, *tickets):
    if len(tickets) == 0:
        return
    id_name_map = get_ticket_type_id_name_map(request)
    for ticket in tickets:
        ticket["type_name"] = id_name_map.get(ticket.get('type_id', None), None)


def ensure_ticket_user_name(request, *tickets):
    if len(tickets) == 0:
        return
    id_name_map = {}
    user_list = api.keystone.user_list(request)
    for item in user_list:
        user = item.to_dict()
        id_name_map[user.get('id')] = user.get('name')

    for ticket in tickets:
        ticket['user_name'] = id_name_map.get(ticket.get('requester_id', None), None)


def ensure_ticket_project_name(request, *tickets):
    if len(tickets) == 0:
        return
    id_name_map = {}
    projects, has_more = api.keystone.dedicated_tenant_list(request)
    for item in projects:
        user = item.to_dict()
        id_name_map[user.get('id')] = user.get('name')

    for ticket in tickets:
        ticket['project_name'] = id_name_map.get(ticket.get('requester_project_id', None), None)


def ensure_reply_user_name(request, *replies):
    if len(replies) == 0:
        return
    id_name_map = {}
    user_list = api.keystone.user_list(request)
    for item in user_list:
        user = item.to_dict()
        id_name_map[user.get('id')] = user.get('name')

    for reply in replies:
        reply['author_name'] = id_name_map.get(reply.get('author_id', None), None)


def ensure_l2_policy_name(request, groups):
    l2_policy_list = api.gbp.l2policy_list(request,
                                           request.user.tenant_id)
    l2_policy_dict = SortedDict([(p.id, p) for p in l2_policy_list])

    for group in groups:
        policy_for_group = l2_policy_dict.get(group.l2_policy_id, None)
        if policy_for_group:
            group_dict = group.get_dict()
            group_dict['l2_policy_name'] = policy_for_group.name

    return groups


def ensure_l3_policy_name(request, groups):
    l3_policy_list = api.gbp.l3policy_list(request,
                                           request.user.tenant_id)
    l3_policy_dict = SortedDict([(p.id, p) for p in l3_policy_list])

    try:
        for group in groups:
            policy_for_group = l3_policy_dict.get(group.l3_policy_id, None)
            if policy_for_group:
                group_dict = group.get_dict()
                group_dict['l3_policy_name'] = policy_for_group.name
    except AttributeError:
        pass

    return groups


def ensure_policy_rule_set_name(request, groups, policy_rule_set_name):
    policy_rule_sets = api.gbp.policy_rule_set_list(request,
                                                    request.user.tenant_id)
    policy_rule_set_dict = SortedDict([(pr.id, pr)
                                       for pr in policy_rule_sets])

    for group in groups:
        group.get_dict()[policy_rule_set_name +
                         '_policy_rule_set_names'] = []
        for group_policy_rule_id in getattr(group, policy_rule_set_name +
                '_policy_rule_sets', None):
            group_policy_rule = policy_rule_set_dict.get(
                group_policy_rule_id)
            group.get_dict()[policy_rule_set_name +
                             '_policy_rule_set_names'] \
                .append(group_policy_rule.name)

    return groups


def ensure_policy_rule_set(request, groups, policy_rule_set_name):
    policy_rule_sets = api.gbp.policy_rule_set_list(request,
                                                    request.user.tenant_id)
    policyrules = api.gbp.policyrule_list(request, request.user.tenant_id)
    policyrules_dict = SortedDict([(rule.id, rule) for rule in policyrules])

    for contract in policy_rule_sets:
        contract.get_dict()['policy_rule_names'] = []
        for rule in contract.policy_rules:
            this_policyrule = policyrules_dict.get(rule)
            if this_policyrule is None:
                continue
            contract.get_dict()['policy_rule_names'].append(
                this_policyrule.name)

    policy_rule_set_dict = SortedDict([(pr.id, pr)
                                       for pr in policy_rule_sets])

    for group in groups:
        group.get_dict()[policy_rule_set_name +
                         '_policy_rule_set_list'] = []
        for group_policy_rule_id in getattr(group, policy_rule_set_name +
                '_policy_rule_sets', None):
            group_policy_rule = policy_rule_set_dict.get(
                group_policy_rule_id)
            group.get_dict()[policy_rule_set_name +
                             '_policy_rule_set_list'] \
                .append(group_policy_rule)

    return groups


def ensure_external_connectivity(request, groups):
    external_connectivities = api.gbp.externalconnectivity_list(
        request, request.user.tenant_id)

    external_connectivities_dict = \
        SortedDict([(con.id, con) for con in external_connectivities])

    for group in groups:
        segments = []
        for segment in group.external_segments:
            segment_obj = external_connectivities_dict.get(segment)
            segments.append(segment_obj.name)

        group.get_dict()['external_segment_names'] = segments

    return groups


def ensure_plugin_version(request, results):
    plugins = api.sahara.plugin_list(request)
    plugins_dict = SortedDict([(plugin.name, plugin.versions)
                               for plugin in plugins])
    for i in results:
        versions = plugins_dict.get(i.get('plugin_name'))
        if versions:
            i.update({'plugin_version': versions})
    return results


def ensure_node_group_template(request, result):
    node_group_templates = api.sahara.nodegroup_template_list(request)
    node_group_templates_dict = SortedDict([(n.id, n.to_dict())
                                            for n in node_group_templates])
    master_node_tag = ['namenode', "NAMENODE", 'HDFS_NAMENODE']
    for i in result:
        node_groups = i.get('node_groups')
        node_count = 0
        if not node_groups:
            continue
        for n in node_groups:
            node_group_template_id = n.get('node_group_template_id')
            node_group_template = node_group_templates_dict.get(
                node_group_template_id)
            node_processes = node_group_template.get('node_processes')
            n.update({'is_master_node': False})
            if len([a for a in master_node_tag if a in node_processes]) > 0:
                n.update({'is_master_node': True})
            n.update({'node_group_template': node_group_template})

            node_count += n.get('count', 0)

        i.update({'count': node_count})
    return result


def ensure_sahara_template_name(request, cluster):
    template = api.sahara.cluster_template_get(
        request, cluster.get('cluster_template_id'))
    cluster.update({'cluster_template_name': template.name})


def ensure_sahara_default_image_name(request, cluster):
    default_image = api.sahara.image_get(
        request, cluster.get('default_image_id'))
    cluster.update({'cluster_default_image_name': default_image.name})


def ensure_sahara_neutron_management_network_name(request, cluster):
    network = api.neutron.network_get(
        request, cluster.get('neutron_management_network'), False)
    cluster.update({'neutron_management_network_name': network.name})


def ensure_sahara_floating_ip_pool(request, cluster):
    filter = {}
    if api.keystone.is_dedicated_context(request):
        filter['tenant_id'] = request.user.project_id
    floatingip_pools = api.network.floating_ip_pools_list(request, **filter)
    floatingip_pools_dict = SortedDict([(f.id, f) for f in floatingip_pools])
    node_groups = cluster.get('node_groups')

    for group in node_groups:
        # group['floating_ip_pool_name'] = floatingip_pools_dict.get(
        #     group.get('floating_ip_pool')).name
        group.update({'floating_ip_pool_name': floatingip_pools_dict.get(
            group.get('floating_ip_pool')).name})


class TicketType():
    open = 'Open'
    in_process = 'In Process'
    solved = 'Solved'
    close = 'Close'


ticket_type = TicketType()


def parse_mime_by_filename(filename):
    ext = ''
    try:
        ext = filename.split('.')[-1]
    except Exception:
        ext = '*'
        pass
    str = '.' + ext
    if (str in CONTENT_TYPE):
        return CONTENT_TYPE[str]
    else:
        return 'unknown content_type'


def get_subnet_ip_usage(request, networks):
    network_ip_availabilities = api.neutron.network_ip_availabilities_list(request).get('network_ip_availabilities', [])
    network_subnets_ip_availabilities = {}
    for network_ip_availabilitie in network_ip_availabilities:
        network_id = network_ip_availabilitie.get('network_id')
        subnet_ip_availabilities = network_ip_availabilitie.get('subnet_ip_availability')
        subnets = {}
        for subnet in subnet_ip_availabilities:
            subnet_id = subnet.get('subnet_id')
            total_ips = subnet.get('total_ips')
            used_ips = subnet.get('used_ips')
            subnets[subnet_id] = {'total_ips': total_ips, 'used_ips': used_ips}
        network_subnets_ip_availabilities[network_id] = subnets

    for network in networks:
        network_id = network.get('id')
        subnets = network.get('subnets')
        items = []
        for subnet in subnets:
            if network_subnets_ip_availabilities.get(network_id) is not None:
                total_ips = network_subnets_ip_availabilities.get(network_id).get(subnet.get('id')).get('total_ips')
                used_ips = network_subnets_ip_availabilities.get(network_id).get(subnet.get('id')).get('used_ips')
                subnet['total_ips'] = total_ips
                subnet['used_ips'] = used_ips
            items.append(subnet)
        network['subnets'] = items

    return networks


def ensure_baymodel_flavor(request, baymodels):
    pubFlavors = api.nova.flavor_list(request, is_public=True)
    priFlavors = api.nova.flavor_list(request, is_public=False)
    flavor_dict = {};
    # pub flavors
    for flavor in pubFlavors:
        d = flavor.to_dict()
        flavor_dict[flavor.id] = d
        flavor_dict[flavor.name] = d
    # pri flavors
    for flavor in priFlavors:
        d = flavor.to_dict()
        flavor_dict[flavor.id] = d
        flavor_dict[flavor.name] = d
    for baymodel in baymodels:
        baymodel['master_flavor'] = flavor_dict.get(baymodel.get('master_flavor_id'))
        baymodel['flavor'] = flavor_dict.get(baymodel.get('flavor_id'))
    return baymodels


FILTER_LOG = ('volume.create.end',
              'volume.resize.end',
              'volume.delete.end',
              'volume.attach.end',
              'volume.detach.end',
              'volume.create.start',
              'volume.resize.start',
              'volume.delete.start',
              'volume.attach.start',
              'volume.detach.start',

              'compute.instance.pause.end',
              'compute.instance.unpause.end',
              'compute.instance.power_off.end',
              'compute.instance.power_on.end',
              'compute.instance.suspend',
              'compute.instance.suspend.end',
              'compute.instance.suspend.start',
              'compute.instance.resume.start',
              'compute.instance.resume.end',
              'compute.instance.create.end',
              'compute.instance.delete.end',
              'compute.instance.rebuild.end',
              'compute.instance.shutdown.end',
              'compute.instance.reboot.end',
              'compute.instance.resize.confirm.end',
              'compute.instance.migrate.confirm.end',
              'compute.instance.pause.start',
              'compute.instance.unpause.start',
              'compute.instance.power_off.start',
              'compute.instance.power_on.start',
              'compute.instance.create.start',
              'compute.instance.delete.start',
              'compute.instance.rebuild.start',
              'compute.instance.shutdown.start',
              'compute.instance.reboot.start',
              'compute.instance.resize.confirm.start',
              'compute.instance.migrate.confirm.start',

              'image.create',
              'image.delete',
              'image.upload',

              'floatingip.create.end',
              'floatingip.delete.end',
              'floatingip.create.start',
              'floatingip.delete.start',

              'router.create.end',
              'router.delete.end',
              'router.update.end',

              'network.create.end',
              'network.delete.end',

              'network.update.end',
              'subnet.create.end',
              'subnet.delete.end',
              'subnet.update.end',

              'snapshot.create.end',
              'snapshot.delete.end',

              'security_group.create.end',
              'security_group.delete.end',
              'security_group.update.end',

              'security_group_rule.create.end',
              'security_group_rule.delete.end',
              'security_group_rule.update.end',

              'keypair.create.end',
              'keypair.delete.end',

              'router.create.start',
              'router.delete.start',
              'router.update.start',

              'network.create.start',
              'network.delete.start',

              'network.update.start',
              'subnet.create.start',
              'subnet.delete.start',
              'subnet.update.start',

              'snapshot.create.start',
              'snapshot.delete.start',

              'security_group.create.start',
              'security_group.delete.start',
              'security_group.update.start',

              'security_group_rule.create.start',
              'security_group_rule.delete.start',
              'security_group_rule.update.start',

              'keypair.create.start',
              'keypair.delete.start',
              )

TRANSLATE_ACTION = {
    'volume.create.end': 'Create Volume',
    'volume.resize.end': 'Resize Volume',
    'volume.delete.end': 'Delete Volume',
    'volume.attach.end': 'Attach Volume',
    'volume.detach.end': 'Detach Volume',
    'volume.create.start': 'Create Volume',
    'volume.resize.start': 'Resize Volume',
    'volume.delete.start': 'Delete Volume',
    'volume.attach.start': 'Attach Volume',
    'volume.detach.start': 'Detach Volume',

    'compute.instance.pause.end': 'Pause Instance',
    'compute.instance.unpause.end': 'Unpause Instance',
    'compute.instance.power_off.end': 'PowerOff Instance',
    'compute.instance.power_on.end': 'PowerOn Instance',
    'compute.instance.pause.start': 'Pause Instance',
    'compute.instance.unpause.start': 'Unpause Instance',
    'compute.instance.power_off.start': 'PowerOff Instance',
    'compute.instance.power_on.start': 'PowerOn Instance',
    'compute.instance.suspend.start': 'Suspend Instance',
    'compute.instance.suspend.end': 'Suspend Instance',
    'compute.instance.resume.start': 'Resume Instance',
    'compute.instance.resume.end': 'Resume Instance',
    'compute.instance.create.end': 'Create Instance',
    'compute.instance.delete.end': 'Delete Instance',
    'compute.instance.rebuild.end': 'Rebuild Instance',
    'compute.instance.shutdown.end': 'Shutdown Instance',
    'compute.instance.reboot.end': 'Reboot Instance',
    'compute.instance.resize.confirm.end': 'Resize Instance',
    'compute.instance.migrate.confirm.end': 'Cold Migration',
    'compute.instance.create.start': 'Create Instance',
    'compute.instance.delete.start': 'Delete Instance',
    'compute.instance.rebuild.start': 'Rebuild Instance',
    'compute.instance.shutdown.start': 'Shutdown Instance',
    'compute.instance.reboot.start': 'Reboot Instance',
    'compute.instance.resize.confirm.start': 'Resize Instance',
    'compute.instance.migrate.confirm.start': 'Cold Migration',

    'image.create': 'Create Instance Snapshot',
    'image.delete': 'Delete Instance Snapshot',
    'image.upload': 'Upload Image',
    'image.update': 'Update Image',

    'floatingip.create.end': 'Allocate Floating IP',
    'floatingip.delete.end': 'Delete Floating IP',

    'router.create.end': 'Create Router',
    'router.delete.end': 'Delete Router',
    'router.update.end': 'Update Router',

    'network.create.end': 'Create Network',
    'network.delete.end': 'Delete Network',
    'network.update.end': 'Update Network',

    'subnet.create.end': 'Create Subnet',
    'subnet.update.end': 'Update Subnet',
    'subnet.delete.end': 'Delete Subnet',

    'snapshot.create.end': 'Create Snapshot',
    'snapshot.delete.end': 'Delete Snapshot',

    'security_group.create.end': 'Create Security_group',
    'security_group.delete.end': 'Delete Security_group',
    'security_group.update.end': 'Update Security_group',

    'security_group_rule.create.end': 'Create Security_group_rule',
    'security_group_rule.delete.end': 'Delete Security_group_rule',
    'security_group_rule.update.end': 'Update Security_group_rule',

    'keypair.create.end': 'Create Keypair',
    'keypair.delete.end': 'Delete Keypair',

    'floatingip.create.start': 'Allocate Floating IP',
    'floatingip.delete.start': 'Delete Floating IP',

    'router.create.start': 'Create Router',
    'router.delete.start': 'Delete Router',
    'router.update.start': 'Update Router',

    'network.create.start': 'Create Network',
    'network.delete.start': 'Delete Network',
    'network.update.start': 'Update Network',

    'subnet.create.start': 'Create Subnet',
    'subnet.update.start': 'Update Subnet',
    'subnet.delete.start': 'Delete Subnet',

    'snapshot.create.start': 'Create Snapshot',
    'snapshot.delete.start': 'Delete Snapshot',

    'security_group.create.start': 'Create Security_group',
    'security_group.delete.start': 'Delete Security_group',
    'security_group.update.start': 'Update Security_group',

    'security_group_rule.create.start': 'Create Security_group_rule',
    'security_group_rule.delete.start': 'Delete Security_group_rule',
    'security_group_rule.update.start': 'Update Security_group_rule',

    'keypair.create.start': 'Create Keypair',
    'keypair.delete.start': 'Delete Keypair',
}

ABSTRCT_EVENT_TYPE_NAME = {
    'volume.create.end': 'volume',
    'volume.resize.end': 'volume',
    'volume.delete.end': 'volume',
    'volume.attach.end': 'volume',
    'volume.detach.end': 'volume',
    'volume.create.start': 'volume',
    'volume.resize.start': 'volume',
    'volume.delete.start': 'volume',
    'volume.attach.start': 'volume',
    'volume.detach.start': 'volume',

    'compute.instance.pause.end': 'instance',
    'compute.instance.unpause.end': 'instance',
    'compute.instance.power_off.end': 'instance',
    'compute.instance.power_on.end': 'instance',
    'compute.instance.pause.start': 'instance',
    'compute.instance.unpause.start': 'instance',
    'compute.instance.power_off.start': 'instance',
    'compute.instance.power_on.start': 'instance',
    'compute.instance.suspend': 'instance',
    'compute.instance.resume.end': 'instance',
    'compute.instance.resume.start': 'instance',
    'compute.instance.suspend.end': 'instance',
    'compute.instance.suspend.start': 'instance',
    'compute.instance.create.end': 'instance',
    'compute.instance.delete.end': 'instance',
    'compute.instance.rebuild.end': 'instance',
    'compute.instance.shutdown.end': 'instance',
    'compute.instance.reboot.end': 'instance',
    'compute.instance.resize.confirm.end': 'instance',
    'compute.instance.create.start': 'instance',
    'compute.instance.delete.start': 'instance',
    'compute.instance.rebuild.start': 'instance',
    'compute.instance.shutdown.start': 'instance',
    'compute.instance.reboot.start': 'instance',
    'compute.instance.resize.confirm.start': 'instance',

    'image.create': 'instance',
    'image.delete': 'instance',
    'image.upload': 'instance',
    'image.update': 'instance',

    'floatingip.create.end': 'ip.floating',
    'floatingip.delete.end': 'ip.floating',

    'router.create.end': 'router',
    'router.delete.end': 'router',
    'router.update.end': 'router',

    'network.create.end': 'network',
    'network.delete.end': 'network',
    'network.update.end': 'network',

    'subnet.create.end': 'subnet',
    'subnet.update.end': 'subnet',
    'subnet.delete.end': 'subnet',

    'snapshot.create.end': 'snapshot',
    'snapshot.delete.end': 'snapshot',

    'security_group.create.end': 'security_group',
    'security_group.delete.end': 'security_group',
    'security_group.update.end': 'security_group',

    'security_group_rule.create.end': 'security_group_rule',
    'security_group_rule.delete.end': 'security_group_rule',
    'security_group_rule.update.end': 'security_group_rule',

    'keypair.create.end': 'keypair',
    'keypair.delete.end': 'keypair',

    'floatingip.create.start': 'ip.floating',
    'floatingip.delete.start': 'ip.floating',

    'router.create.start': 'router',
    'router.delete.start': 'router',
    'router.update.start': 'router',

    'network.create.start': 'network',
    'network.delete.start': 'network',
    'network.update.start': 'network',

    'subnet.create.start': 'subnet',
    'subnet.update.start': 'subnet',
    'subnet.delete.start': 'subnet',

    'snapshot.create.start': 'snapshot',
    'snapshot.delete.start': 'snapshot',

    'security_group.create.start': 'security_group',
    'security_group.delete.start': 'security_group',
    'security_group.update.start': 'security_group',

    'security_group_rule.create.start': 'security_group_rule',
    'security_group_rule.delete.start': 'security_group_rule',
    'security_group_rule.update.start': 'security_group_rule',

    'keypair.create.start': 'keypair',
    'keypair.delete.start': 'keypair',
}
CONTENT_TYPE = {
    '.load': 'text/html',
    '.123': 'application/vnd.lotus-1-2-3',
    '.3ds': 'image/x-3ds',
    '.3g2': 'video/3gpp',
    '.3ga': 'video/3gpp',
    '.3gp': 'video/3gpp',
    '.3gpp': 'video/3gpp',
    '.602': 'application/x-t602',
    '.669': 'audio/x-mod',
    '.7z': 'application/x-7z-compressed',
    '.a': 'application/x-archive',
    '.aac': 'audio/mp4',
    '.abw': 'application/x-abiword',
    '.abw.crashed': 'application/x-abiword',
    '.abw.gz': 'application/x-abiword',
    '.ac3': 'audio/ac3',
    '.ace': 'application/x-ace',
    '.adb': 'text/x-adasrc',
    '.ads': 'text/x-adasrc',
    '.afm': 'application/x-font-afm',
    '.ag': 'image/x-applix-graphics',
    '.ai': 'application/illustrator',
    '.aif': 'audio/x-aiff',
    '.aifc': 'audio/x-aiff',
    '.aiff': 'audio/x-aiff',
    '.al': 'application/x-perl',
    '.alz': 'application/x-alz',
    '.amr': 'audio/amr',
    '.ani': 'application/x-navi-animation',
    '.anim[1-9j]': 'video/x-anim',
    '.anx': 'application/annodex',
    '.ape': 'audio/x-ape',
    '.arj': 'application/x-arj',
    '.arw': 'image/x-sony-arw',
    '.as': 'application/x-applix-spreadsheet',
    '.asc': 'text/plain',
    '.asf': 'video/x-ms-asf',
    '.asp': 'application/x-asp',
    '.ass': 'text/x-ssa',
    '.asx': 'audio/x-ms-asx',
    '.atom': 'application/atom+xml',
    '.au': 'audio/basic',
    '.avi': 'video/x-msvideo',
    '.aw': 'application/x-applix-word',
    '.awb': 'audio/amr-wb',
    '.awk': 'application/x-awk',
    '.axa': 'audio/annodex',
    '.axv': 'video/annodex',
    '.bak': 'application/x-trash',
    '.bcpio': 'application/x-bcpio',
    '.bdf': 'application/x-font-bdf',
    '.bib': 'text/x-bibtex',
    '.bin': 'application/octet-stream',
    '.blend': 'application/x-blender',
    '.blender': 'application/x-blender',
    '.bmp': 'image/bmp',
    '.bz': 'application/x-bzip',
    '.bz2': 'application/x-bzip',
    '.c': 'text/x-csrc',
    '.c++': 'text/x-c++src',
    '.cab': 'application/vnd.ms-cab-compressed',
    '.cb7': 'application/x-cb7',
    '.cbr': 'application/x-cbr',
    '.cbt': 'application/x-cbt',
    '.cbz': 'application/x-cbz',
    '.cc': 'text/x-c++src',
    '.cdf': 'application/x-netcdf',
    '.cdr': 'application/vnd.corel-draw',
    '.cer': 'application/x-x509-ca-cert',
    '.cert': 'application/x-x509-ca-cert',
    '.cgm': 'image/cgm',
    '.chm': 'application/x-chm',
    '.chrt': 'application/x-kchart',
    '.class': 'application/x-java',
    '.cls': 'text/x-tex',
    '.cmake': 'text/x-cmake',
    '.cpio': 'application/x-cpio',
    '.cpio.gz': 'application/x-cpio-compressed',
    '.cpp': 'text/x-c++src',
    '.cr2': 'image/x-canon-cr2',
    '.crt': 'application/x-x509-ca-cert',
    '.crw': 'image/x-canon-crw',
    '.cs': 'text/x-csharp',
    '.csh': 'application/x-csh',
    '.css': 'text/css',
    '.cssl': 'text/css',
    '.csv': 'text/csv',
    '.cue': 'application/x-cue',
    '.cur': 'image/x-win-bitmap',
    '.cxx': 'text/x-c++src',
    '.d': 'text/x-dsrc',
    '.dar': 'application/x-dar',
    '.dbf': 'application/x-dbf',
    '.dc': 'application/x-dc-rom',
    '.dcl': 'text/x-dcl',
    '.dcm': 'application/dicom',
    '.dcr': 'image/x-kodak-dcr',
    '.dds': 'image/x-dds',
    '.deb': 'application/x-deb',
    '.der': 'application/x-x509-ca-cert',
    '.desktop': 'application/x-desktop',
    '.dia': 'application/x-dia-diagram',
    '.diff': 'text/x-patch',
    '.divx': 'video/x-msvideo',
    '.djv': 'image/vnd.djvu',
    '.djvu': 'image/vnd.djvu',
    '.dng': 'image/x-adobe-dng',
    '.doc': 'application/msword',
    '.docbook': 'application/docbook+xml',
    '.docm': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.dot': 'text/vnd.graphviz',
    '.dsl': 'text/x-dsl',
    '.dtd': 'application/xml-dtd',
    '.dtx': 'text/x-tex',
    '.dv': 'video/dv',
    '.dvi': 'application/x-dvi',
    '.dvi.bz2': 'application/x-bzdvi',
    '.dvi.gz': 'application/x-gzdvi',
    '.dwg': 'image/vnd.dwg',
    '.dxf': 'image/vnd.dxf',
    '.e': 'text/x-eiffel',
    '.egon': 'application/x-egon',
    '.eif': 'text/x-eiffel',
    '.el': 'text/x-emacs-lisp',
    '.emf': 'image/x-emf',
    '.emp': 'application/vnd.emusic-emusic_package',
    '.ent': 'application/xml-external-parsed-entity',
    '.eps': 'image/x-eps',
    '.eps.bz2': 'image/x-bzeps',
    '.eps.gz': 'image/x-gzeps',
    '.epsf': 'image/x-eps',
    '.epsf.bz2': 'image/x-bzeps',
    '.epsf.gz': 'image/x-gzeps',
    '.epsi': 'image/x-eps',
    '.epsi.bz2': 'image/x-bzeps',
    '.epsi.gz': 'image/x-gzeps',
    '.epub': 'application/epub+zip',
    '.erl': 'text/x-erlang',
    '.es': 'application/ecmascript',
    '.etheme': 'application/x-e-theme',
    '.etx': 'text/x-setext',
    '.exe': 'application/x-ms-dos-executable',
    '.exr': 'image/x-exr',
    '.ez': 'application/andrew-inset',
    '.f': 'text/x-fortran',
    '.f90': 'text/x-fortran',
    '.f95': 'text/x-fortran',
    '.fb2': 'application/x-fictionbook+xml',
    '.fig': 'image/x-xfig',
    '.fits': 'image/fits',
    '.fl': 'application/x-fluid',
    '.flac': 'audio/x-flac',
    '.flc': 'video/x-flic',
    '.fli': 'video/x-flic',
    '.flv': 'video/x-flv',
    '.flw': 'application/x-kivio',
    '.fo': 'text/x-xslfo',
    '.for': 'text/x-fortran',
    '.g3': 'image/fax-g3',
    '.gb': 'application/x-gameboy-rom',
    '.gba': 'application/x-gba-rom',
    '.gcrd': 'text/directory',
    '.ged': 'application/x-gedcom',
    '.gedcom': 'application/x-gedcom',
    '.gen': 'application/x-genesis-rom',
    '.gf': 'application/x-tex-gf',
    '.gg': 'application/x-sms-rom',
    '.gif': 'image/gif',
    '.glade': 'application/x-glade',
    '.gmo': 'application/x-gettext-translation',
    '.gnc': 'application/x-gnucash',
    '.gnd': 'application/gnunet-directory',
    '.gnucash': 'application/x-gnucash',
    '.gnumeric': 'application/x-gnumeric',
    '.gnuplot': 'application/x-gnuplot',
    '.gp': 'application/x-gnuplot',
    '.gpg': 'application/pgp-encrypted',
    '.gplt': 'application/x-gnuplot',
    '.gra': 'application/x-graphite',
    '.gsf': 'application/x-font-type1',
    '.gsm': 'audio/x-gsm',
    '.gtar': 'application/x-tar',
    '.gv': 'text/vnd.graphviz',
    '.gvp': 'text/x-google-video-pointer',
    '.gz': 'application/x-gzip',
    '.h': 'text/x-chdr',
    '.h++': 'text/x-c++hdr',
    '.hdf': 'application/x-hdf',
    '.hh': 'text/x-c++hdr',
    '.hp': 'text/x-c++hdr',
    '.hpgl': 'application/vnd.hp-hpgl',
    '.hpp': 'text/x-c++hdr',
    '.hs': 'text/x-haskell',
    '.htm': 'text/html',
    '.html': 'text/html',
    '.hwp': 'application/x-hwp',
    '.hwt': 'application/x-hwt',
    '.hxx': 'text/x-c++hdr',
    '.ica': 'application/x-ica',
    '.icb': 'image/x-tga',
    '.icns': 'image/x-icns',
    '.ico': 'image/vnd.microsoft.icon',
    '.ics': 'text/calendar',
    '.idl': 'text/x-idl',
    '.ief': 'image/ief',
    '.iff': 'image/x-iff',
    '.ilbm': 'image/x-ilbm',
    '.ime': 'text/x-imelody',
    '.imy': 'text/x-imelody',
    '.ins': 'text/x-tex',
    '.iptables': 'text/x-iptables',
    '.iso': 'application/x-cd-image',
    '.iso9660': 'application/x-cd-image',
    '.it': 'audio/x-it',
    '.j2k': 'image/jp2',
    '.jad': 'text/vnd.sun.j2me.app-descriptor',
    '.jar': 'application/x-java-archive',
    '.java': 'text/x-java',
    '.jng': 'image/x-jng',
    '.jnlp': 'application/x-java-jnlp-file',
    '.jp2': 'image/jp2',
    '.jpc': 'image/jp2',
    '.jpe': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.jpf': 'image/jp2',
    '.jpg': 'image/jpeg',
    '.jpr': 'application/x-jbuilder-project',
    '.jpx': 'image/jp2',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.jsonp': 'application/jsonp',
    '.k25': 'image/x-kodak-k25',
    '.kar': 'audio/midi',
    '.karbon': 'application/x-karbon',
    '.kdc': 'image/x-kodak-kdc',
    '.kdelnk': 'application/x-desktop',
    '.kexi': 'application/x-kexiproject-sqlite3',
    '.kexic': 'application/x-kexi-connectiondata',
    '.kexis': 'application/x-kexiproject-shortcut',
    '.kfo': 'application/x-kformula',
    '.kil': 'application/x-killustrator',
    '.kino': 'application/smil',
    '.kml': 'application/vnd.google-earth.kml+xml',
    '.kmz': 'application/vnd.google-earth.kmz',
    '.kon': 'application/x-kontour',
    '.kpm': 'application/x-kpovmodeler',
    '.kpr': 'application/x-kpresenter',
    '.kpt': 'application/x-kpresenter',
    '.kra': 'application/x-krita',
    '.ksp': 'application/x-kspread',
    '.kud': 'application/x-kugar',
    '.kwd': 'application/x-kword',
    '.kwt': 'application/x-kword',
    '.la': 'application/x-shared-library-la',
    '.latex': 'text/x-tex',
    '.ldif': 'text/x-ldif',
    '.lha': 'application/x-lha',
    '.lhs': 'text/x-literate-haskell',
    '.lhz': 'application/x-lhz',
    '.log': 'text/x-log',
    '.ltx': 'text/x-tex',
    '.lua': 'text/x-lua',
    '.lwo': 'image/x-lwo',
    '.lwob': 'image/x-lwo',
    '.lws': 'image/x-lws',
    '.ly': 'text/x-lilypond',
    '.lyx': 'application/x-lyx',
    '.lz': 'application/x-lzip',
    '.lzh': 'application/x-lha',
    '.lzma': 'application/x-lzma',
    '.lzo': 'application/x-lzop',
    '.m': 'text/x-matlab',
    '.m15': 'audio/x-mod',
    '.m2t': 'video/mpeg',
    '.m3u': 'audio/x-mpegurl',
    '.m3u8': 'audio/x-mpegurl',
    '.m4': 'application/x-m4',
    '.m4a': 'audio/mp4',
    '.m4b': 'audio/x-m4b',
    '.m4v': 'video/mp4',
    '.mab': 'application/x-markaby',
    '.man': 'application/x-troff-man',
    '.mbox': 'application/mbox',
    '.md': 'application/x-genesis-rom',
    '.mdb': 'application/vnd.ms-access',
    '.mdi': 'image/vnd.ms-modi',
    '.me': 'text/x-troff-me',
    '.med': 'audio/x-mod',
    '.metalink': 'application/metalink+xml',
    '.mgp': 'application/x-magicpoint',
    '.mid': 'audio/midi',
    '.midi': 'audio/midi',
    '.mif': 'application/x-mif',
    '.minipsf': 'audio/x-minipsf',
    '.mka': 'audio/x-matroska',
    '.mkv': 'video/x-matroska',
    '.ml': 'text/x-ocaml',
    '.mli': 'text/x-ocaml',
    '.mm': 'text/x-troff-mm',
    '.mmf': 'application/x-smaf',
    '.mml': 'text/mathml',
    '.mng': 'video/x-mng',
    '.mo': 'application/x-gettext-translation',
    '.mo3': 'audio/x-mo3',
    '.moc': 'text/x-moc',
    '.mod': 'audio/x-mod',
    '.mof': 'text/x-mof',
    '.moov': 'video/quicktime',
    '.mov': 'video/quicktime',
    '.movie': 'video/x-sgi-movie',
    '.mp+': 'audio/x-musepack',
    '.mp2': 'video/mpeg',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.mpc': 'audio/x-musepack',
    '.mpe': 'video/mpeg',
    '.mpeg': 'video/mpeg',
    '.mpg': 'video/mpeg',
    '.mpga': 'audio/mpeg',
    '.mpp': 'audio/x-musepack',
    '.mrl': 'text/x-mrml',
    '.mrml': 'text/x-mrml',
    '.mrw': 'image/x-minolta-mrw',
    '.ms': 'text/x-troff-ms',
    '.msi': 'application/x-msi',
    '.msod': 'image/x-msod',
    '.msx': 'application/x-msx-rom',
    '.mtm': 'audio/x-mod',
    '.mup': 'text/x-mup',
    '.mxf': 'application/mxf',
    '.n64': 'application/x-n64-rom',
    '.nb': 'application/mathematica',
    '.nc': 'application/x-netcdf',
    '.nds': 'application/x-nintendo-ds-rom',
    '.nef': 'image/x-nikon-nef',
    '.nes': 'application/x-nes-rom',
    '.nfo': 'text/x-nfo',
    '.not': 'text/x-mup',
    '.nsc': 'application/x-netshow-channel',
    '.nsv': 'video/x-nsv',
    '.o': 'application/x-object',
    '.obj': 'application/x-tgif',
    '.ocl': 'text/x-ocl',
    '.oda': 'application/oda',
    '.odb': 'application/vnd.oasis.opendocument.database',
    '.odc': 'application/vnd.oasis.opendocument.chart',
    '.odf': 'application/vnd.oasis.opendocument.formula',
    '.odg': 'application/vnd.oasis.opendocument.graphics',
    '.odi': 'application/vnd.oasis.opendocument.image',
    '.odm': 'application/vnd.oasis.opendocument.text-master',
    '.odp': 'application/vnd.oasis.opendocument.presentation',
    '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
    '.odt': 'application/vnd.oasis.opendocument.text',
    '.oga': 'audio/ogg',
    '.ogg': 'video/x-theora+ogg',
    '.ogm': 'video/x-ogm+ogg',
    '.ogv': 'video/ogg',
    '.ogx': 'application/ogg',
    '.old': 'application/x-trash',
    '.oleo': 'application/x-oleo',
    '.opml': 'text/x-opml+xml',
    '.ora': 'image/openraster',
    '.orf': 'image/x-olympus-orf',
    '.otc': 'application/vnd.oasis.opendocument.chart-template',
    '.otf': 'application/x-font-otf',
    '.otg': 'application/vnd.oasis.opendocument.graphics-template',
    '.oth': 'application/vnd.oasis.opendocument.text-web',
    '.otp': 'application/vnd.oasis.opendocument.presentation-template',
    '.ots': 'application/vnd.oasis.opendocument.spreadsheet-template',
    '.ott': 'application/vnd.oasis.opendocument.text-template',
    '.owl': 'application/rdf+xml',
    '.oxt': 'application/vnd.openofficeorg.extension',
    '.p': 'text/x-pascal',
    '.p10': 'application/pkcs10',
    '.p12': 'application/x-pkcs12',
    '.p7b': 'application/x-pkcs7-certificates',
    '.p7s': 'application/pkcs7-signature',
    '.pack': 'application/x-java-pack200',
    '.pak': 'application/x-pak',
    '.par2': 'application/x-par2',
    '.pas': 'text/x-pascal',
    '.patch': 'text/x-patch',
    '.pbm': 'image/x-portable-bitmap',
    '.pcd': 'image/x-photo-cd',
    '.pcf': 'application/x-cisco-vpn-settings',
    '.pcf.gz': 'application/x-font-pcf',
    '.pcf.z': 'application/x-font-pcf',
    '.pcl': 'application/vnd.hp-pcl',
    '.pcx': 'image/x-pcx',
    '.pdb': 'chemical/x-pdb',
    '.pdc': 'application/x-aportisdoc',
    '.pdf': 'application/pdf',
    '.pdf.bz2': 'application/x-bzpdf',
    '.pdf.gz': 'application/x-gzpdf',
    '.pef': 'image/x-pentax-pef',
    '.pem': 'application/x-x509-ca-cert',
    '.perl': 'application/x-perl',
    '.pfa': 'application/x-font-type1',
    '.pfb': 'application/x-font-type1',
    '.pfx': 'application/x-pkcs12',
    '.pgm': 'image/x-portable-graymap',
    '.pgn': 'application/x-chess-pgn',
    '.pgp': 'application/pgp-encrypted',
    '.php': 'application/x-php',
    '.php3': 'application/x-php',
    '.php4': 'application/x-php',
    '.pict': 'image/x-pict',
    '.pict1': 'image/x-pict',
    '.pict2': 'image/x-pict',
    '.pickle': 'application/python-pickle',
    '.pk': 'application/x-tex-pk',
    '.pkipath': 'application/pkix-pkipath',
    '.pkr': 'application/pgp-keys',
    '.pl': 'application/x-perl',
    '.pla': 'audio/x-iriver-pla',
    '.pln': 'application/x-planperfect',
    '.pls': 'audio/x-scpls',
    '.pm': 'application/x-perl',
    '.png': 'image/png',
    '.pnm': 'image/x-portable-anymap',
    '.pntg': 'image/x-macpaint',
    '.po': 'text/x-gettext-translation',
    '.por': 'application/x-spss-por',
    '.pot': 'text/x-gettext-translation-template',
    '.ppm': 'image/x-portable-pixmap',
    '.pps': 'application/vnd.ms-powerpoint',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptm': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.ppz': 'application/vnd.ms-powerpoint',
    '.prc': 'application/x-palm-database',
    '.ps': 'application/postscript',
    '.ps.bz2': 'application/x-bzpostscript',
    '.ps.gz': 'application/x-gzpostscript',
    '.psd': 'image/vnd.adobe.photoshop',
    '.psf': 'audio/x-psf',
    '.psf.gz': 'application/x-gz-font-linux-psf',
    '.psflib': 'audio/x-psflib',
    '.psid': 'audio/prs.sid',
    '.psw': 'application/x-pocket-word',
    '.pw': 'application/x-pw',
    '.py': 'text/x-python',
    '.pyc': 'application/x-python-bytecode',
    '.pyo': 'application/x-python-bytecode',
    '.qif': 'image/x-quicktime',
    '.qt': 'video/quicktime',
    '.qtif': 'image/x-quicktime',
    '.qtl': 'application/x-quicktime-media-link',
    '.qtvr': 'video/quicktime',
    '.ra': 'audio/vnd.rn-realaudio',
    '.raf': 'image/x-fuji-raf',
    '.ram': 'application/ram',
    '.rar': 'application/x-rar',
    '.ras': 'image/x-cmu-raster',
    '.raw': 'image/x-panasonic-raw',
    '.rax': 'audio/vnd.rn-realaudio',
    '.rb': 'application/x-ruby',
    '.rdf': 'application/rdf+xml',
    '.rdfs': 'application/rdf+xml',
    '.reg': 'text/x-ms-regedit',
    '.rej': 'application/x-reject',
    '.rgb': 'image/x-rgb',
    '.rle': 'image/rle',
    '.rm': 'application/vnd.rn-realmedia',
    '.rmj': 'application/vnd.rn-realmedia',
    '.rmm': 'application/vnd.rn-realmedia',
    '.rms': 'application/vnd.rn-realmedia',
    '.rmvb': 'application/vnd.rn-realmedia',
    '.rmx': 'application/vnd.rn-realmedia',
    '.roff': 'text/troff',
    '.rp': 'image/vnd.rn-realpix',
    '.rpm': 'application/x-rpm',
    '.rss': 'application/rss+xml',
    '.rt': 'text/vnd.rn-realtext',
    '.rtf': 'application/rtf',
    '.rtx': 'text/richtext',
    '.rv': 'video/vnd.rn-realvideo',
    '.rvx': 'video/vnd.rn-realvideo',
    '.s3m': 'audio/x-s3m',
    '.sam': 'application/x-amipro',
    '.sami': 'application/x-sami',
    '.sav': 'application/x-spss-sav',
    '.scm': 'text/x-scheme',
    '.sda': 'application/vnd.stardivision.draw',
    '.sdc': 'application/vnd.stardivision.calc',
    '.sdd': 'application/vnd.stardivision.impress',
    '.sdp': 'application/sdp',
    '.sds': 'application/vnd.stardivision.chart',
    '.sdw': 'application/vnd.stardivision.writer',
    '.sgf': 'application/x-go-sgf',
    '.sgi': 'image/x-sgi',
    '.sgl': 'application/vnd.stardivision.writer',
    '.sgm': 'text/sgml',
    '.sgml': 'text/sgml',
    '.sh': 'application/x-shellscript',
    '.shar': 'application/x-shar',
    '.shn': 'application/x-shorten',
    '.siag': 'application/x-siag',
    '.sid': 'audio/prs.sid',
    '.sik': 'application/x-trash',
    '.sis': 'application/vnd.symbian.install',
    '.sisx': 'x-epoc/x-sisx-app',
    '.sit': 'application/x-stuffit',
    '.siv': 'application/sieve',
    '.sk': 'image/x-skencil',
    '.sk1': 'image/x-skencil',
    '.skr': 'application/pgp-keys',
    '.slk': 'text/spreadsheet',
    '.smaf': 'application/x-smaf',
    '.smc': 'application/x-snes-rom',
    '.smd': 'application/vnd.stardivision.mail',
    '.smf': 'application/vnd.stardivision.math',
    '.smi': 'application/x-sami',
    '.smil': 'application/smil',
    '.sml': 'application/smil',
    '.sms': 'application/x-sms-rom',
    '.snd': 'audio/basic',
    '.so': 'application/x-sharedlib',
    '.spc': 'application/x-pkcs7-certificates',
    '.spd': 'application/x-font-speedo',
    '.spec': 'text/x-rpm-spec',
    '.spl': 'application/x-shockwave-flash',
    '.spx': 'audio/x-speex',
    '.sql': 'text/x-sql',
    '.sr2': 'image/x-sony-sr2',
    '.src': 'application/x-wais-source',
    '.srf': 'image/x-sony-srf',
    '.srt': 'application/x-subrip',
    '.ssa': 'text/x-ssa',
    '.stc': 'application/vnd.sun.xml.calc.template',
    '.std': 'application/vnd.sun.xml.draw.template',
    '.sti': 'application/vnd.sun.xml.impress.template',
    '.stm': 'audio/x-stm',
    '.stw': 'application/vnd.sun.xml.writer.template',
    '.sty': 'text/x-tex',
    '.sub': 'text/x-subviewer',
    '.sun': 'image/x-sun-raster',
    '.sv4cpio': 'application/x-sv4cpio',
    '.sv4crc': 'application/x-sv4crc',
    '.svg': 'image/svg+xml',
    '.svgz': 'image/svg+xml-compressed',
    '.swf': 'application/x-shockwave-flash',
    '.sxc': 'application/vnd.sun.xml.calc',
    '.sxd': 'application/vnd.sun.xml.draw',
    '.sxg': 'application/vnd.sun.xml.writer.global',
    '.sxi': 'application/vnd.sun.xml.impress',
    '.sxm': 'application/vnd.sun.xml.math',
    '.sxw': 'application/vnd.sun.xml.writer',
    '.sylk': 'text/spreadsheet',
    '.t': 'text/troff',
    '.t2t': 'text/x-txt2tags',
    '.tar': 'application/x-tar',
    '.tar.bz': 'application/x-bzip-compressed-tar',
    '.tar.bz2': 'application/x-bzip-compressed-tar',
    '.tar.gz': 'application/x-compressed-tar',
    '.tar.lzma': 'application/x-lzma-compressed-tar',
    '.tar.lzo': 'application/x-tzo',
    '.tar.xz': 'application/x-xz-compressed-tar',
    '.tar.z': 'application/x-tarz',
    '.tbz': 'application/x-bzip-compressed-tar',
    '.tbz2': 'application/x-bzip-compressed-tar',
    '.tcl': 'text/x-tcl',
    '.tex': 'text/x-tex',
    '.texi': 'text/x-texinfo',
    '.texinfo': 'text/x-texinfo',
    '.tga': 'image/x-tga',
    '.tgz': 'application/x-compressed-tar',
    '.theme': 'application/x-theme',
    '.themepack': 'application/x-windows-themepack',
    '.tif': 'image/tiff',
    '.tiff': 'image/tiff',
    '.tk': 'text/x-tcl',
    '.tlz': 'application/x-lzma-compressed-tar',
    '.tnef': 'application/vnd.ms-tnef',
    '.tnf': 'application/vnd.ms-tnef',
    '.toc': 'application/x-cdrdao-toc',
    '.torrent': 'application/x-bittorrent',
    '.tpic': 'image/x-tga',
    '.tr': 'text/troff',
    '.ts': 'application/x-linguist',
    '.tsv': 'text/tab-separated-values',
    '.tta': 'audio/x-tta',
    '.ttc': 'application/x-font-ttf',
    '.ttf': 'application/x-font-ttf',
    '.ttx': 'application/x-font-ttx',
    '.txt': 'text/plain',
    '.txz': 'application/x-xz-compressed-tar',
    '.tzo': 'application/x-tzo',
    '.ufraw': 'application/x-ufraw',
    '.ui': 'application/x-designer',
    '.uil': 'text/x-uil',
    '.ult': 'audio/x-mod',
    '.uni': 'audio/x-mod',
    '.uri': 'text/x-uri',
    '.url': 'text/x-uri',
    '.ustar': 'application/x-ustar',
    '.vala': 'text/x-vala',
    '.vapi': 'text/x-vala',
    '.vcf': 'text/directory',
    '.vcs': 'text/calendar',
    '.vct': 'text/directory',
    '.vda': 'image/x-tga',
    '.vhd': 'text/x-vhdl',
    '.vhdl': 'text/x-vhdl',
    '.viv': 'video/vivo',
    '.vivo': 'video/vivo',
    '.vlc': 'audio/x-mpegurl',
    '.vob': 'video/mpeg',
    '.voc': 'audio/x-voc',
    '.vor': 'application/vnd.stardivision.writer',
    '.vst': 'image/x-tga',
    '.wav': 'audio/x-wav',
    '.wax': 'audio/x-ms-asx',
    '.wb1': 'application/x-quattropro',
    '.wb2': 'application/x-quattropro',
    '.wb3': 'application/x-quattropro',
    '.wbmp': 'image/vnd.wap.wbmp',
    '.wcm': 'application/vnd.ms-works',
    '.wdb': 'application/vnd.ms-works',
    '.webm': 'video/webm',
    '.wk1': 'application/vnd.lotus-1-2-3',
    '.wk3': 'application/vnd.lotus-1-2-3',
    '.wk4': 'application/vnd.lotus-1-2-3',
    '.wks': 'application/vnd.ms-works',
    '.wma': 'audio/x-ms-wma',
    '.wmf': 'image/x-wmf',
    '.wml': 'text/vnd.wap.wml',
    '.wmls': 'text/vnd.wap.wmlscript',
    '.wmv': 'video/x-ms-wmv',
    '.wmx': 'audio/x-ms-asx',
    '.wp': 'application/vnd.wordperfect',
    '.wp4': 'application/vnd.wordperfect',
    '.wp5': 'application/vnd.wordperfect',
    '.wp6': 'application/vnd.wordperfect',
    '.wpd': 'application/vnd.wordperfect',
    '.wpg': 'application/x-wpg',
    '.wpl': 'application/vnd.ms-wpl',
    '.wpp': 'application/vnd.wordperfect',
    '.wps': 'application/vnd.ms-works',
    '.wri': 'application/x-mswrite',
    '.wrl': 'model/vrml',
    '.wv': 'audio/x-wavpack',
    '.wvc': 'audio/x-wavpack-correction',
    '.wvp': 'audio/x-wavpack',
    '.wvx': 'audio/x-ms-asx',
    '.x3f': 'image/x-sigma-x3f',
    '.xac': 'application/x-gnucash',
    '.xbel': 'application/x-xbel',
    '.xbl': 'application/xml',
    '.xbm': 'image/x-xbitmap',
    '.xcf': 'image/x-xcf',
    '.xcf.bz2': 'image/x-compressed-xcf',
    '.xcf.gz': 'image/x-compressed-xcf',
    '.xhtml': 'application/xhtml+xml',
    '.xi': 'audio/x-xi',
    '.xla': 'application/vnd.ms-excel',
    '.xlc': 'application/vnd.ms-excel',
    '.xld': 'application/vnd.ms-excel',
    '.xlf': 'application/x-xliff',
    '.xliff': 'application/x-xliff',
    '.xll': 'application/vnd.ms-excel',
    '.xlm': 'application/vnd.ms-excel',
    '.xls': 'application/vnd.ms-excel',
    '.xlsm': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xlt': 'application/vnd.ms-excel',
    '.xlw': 'application/vnd.ms-excel',
    '.xm': 'audio/x-xm',
    '.xmf': 'audio/x-xmf',
    '.xmi': 'text/x-xmi',
    '.xml': 'application/xml',
    '.xpm': 'image/x-xpixmap',
    '.xps': 'application/vnd.ms-xpsdocument',
    '.xsl': 'application/xml',
    '.xslfo': 'text/x-xslfo',
    '.xslt': 'application/xml',
    '.xspf': 'application/xspf+xml',
    '.xul': 'application/vnd.mozilla.xul+xml',
    '.xwd': 'image/x-xwindowdump',
    '.xyz': 'chemical/x-pdb',
    '.xz': 'application/x-xz',
    '.w2p': 'application/w2p',
    '.z': 'application/x-compress',
    '.zabw': 'application/x-abiword',
    '.zip': 'application/zip',
    '.zoo': 'application/x-zoo',
    '.*': 'application/octet-stream',
}

NOVA_PROJECT_QUOTA_FIELDS = ['key_pairs', 'ram', 'cores', 'instances']
CINDER_PROJECT_QUOTA_FIELDS = ['volumes', 'snapshots', 'gigabytes', 'backups', 'backup_gigabytes']
NEUTRON_PROJECT_QUOTA_FIELDS = ['router', 'subnet', 'network', 'floatingip', 'security_group', 'port']
LOADBALANCER_PROJECT_QUOTA_FIELDS = ['healthmonitor', 'listener', 'loadbalancer', 'pool']
MANILA_PROJECT_QUOTA_FIELDS = ['shares', 'snapshots', 'gigabytes', 'share_networks']

LOADBALANCER_DOMAIN_QUOTA_FIELDS = ['healthmonitor', 'listener', 'pool', 'loadbalancer']
MANILA_DOMAIN_QUOTA_FIELDS = ['shares', 'share_gigabytes', 'share_snapshots', 'share_networks']
