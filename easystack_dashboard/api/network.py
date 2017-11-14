# vim: tabstop=4 shiftwidth=4 softtabstop=4

# Copyright 2013 NEC Corporation
#
#    Licensed under the Apache License, Version 2.0 (the "License"); you may
#    not use this file except in compliance with the License. You may obtain
#    a copy of the License at
#
#         http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
#    WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
#    License for the specific language governing permissions and limitations
#    under the License.

"""Abstraction layer for networking functionalities.

Currently Nova and Neutron have duplicated features. This API layer is
introduced to abstract the differences between them for seamless consumption by
different dashboard implementations.
"""

from django.conf import settings  # noqa

from easystack_dashboard.api import base
from easystack_dashboard.api import neutron
from easystack_dashboard.api import nova
from easystack_dashboard.api import billing


class NetworkClient(object):
    def __init__(self, request):
        neutron_enabled = base.is_service_enabled(request, 'network')

        if neutron_enabled:
            self.floating_ips = neutron.FloatingIpManager(request)
        else:
            self.floating_ips = nova.FloatingIpManager(request)

        if (neutron_enabled and
                neutron.is_extension_supported(request, 'security-group')):
            self.secgroups = neutron.SecurityGroupManager(request)
        else:
            self.secgroups = nova.SecurityGroupManager(request)


def floating_ip_supported(request):
    return NetworkClient(request).floating_ips.is_supported()


def floating_ip_pools_list(request, **filter):
    return NetworkClient(request).floating_ips.list_pools(**filter)


def floating_ip_pool_get(request, pool):
    return NetworkClient(request).floating_ips.pool_get(pool)


def tenant_floating_ip_list(request):
    return NetworkClient(request).floating_ips.list()


def tenant_floating_ip_get(request, floating_ip_id):
    return NetworkClient(request).floating_ips.get(floating_ip_id)


@base.create_log_decorator(optype='Create', subject='FloatingIP', detail=None)
@billing.create_product('floatingip', uuid_name='id', quantity='bandwidth')
def tenant_floating_ip_allocate(request, pool=None, bandwidth=None):
    return NetworkClient(request).floating_ips.allocate(pool, bandwidth)


def tenant_floating_ip_release(request, floating_ip_id):
    return NetworkClient(request).floating_ips.release(floating_ip_id)


def floating_ip_associate(request, floating_ip_id, port_id):
    return NetworkClient(request).floating_ips.associate(floating_ip_id,
                                                         port_id)


def floating_ip_update_bandwith(request, floating_ip_id, bandwidth):
    return NetworkClient(request).floating_ips.update_bandwith(floating_ip_id,
                                                               bandwidth)


def floating_ip_disassociate(request, floating_ip_id, port_id):
    return NetworkClient(request).floating_ips.disassociate(floating_ip_id,
                                                            port_id)


def floating_ip_target_list(request):
    return NetworkClient(request).floating_ips.list_targets()


def floating_ip_target_get_by_instance(request, instance_id, cache=None):
    return NetworkClient(request).floating_ips.get_target_id_by_instance(
        instance_id, cache)


def floating_ip_target_list_by_instance(request, instance_id, cache=None):
    floating_ips = NetworkClient(request).floating_ips
    return floating_ips.list_target_id_by_instance(instance_id, cache)


def floating_ip_simple_associate_supported(request):
    return NetworkClient(request).floating_ips.is_simple_associate_supported()


def floating_ip_has_bound_port(request, port_id, floating_ip_list=None):
    if floating_ip_list is None:
        # TODO(lzm): can this filter by port_id?
        floating_ip_list = tenant_floating_ip_list(request)
    for floating_ip in floating_ip_list:
        if port_id == floating_ip.port_id:
            return True
    return False


def floating_ip_can_bind_port(request, floating_ip, instance_port):
    ext_net_id = floating_ip.pool
    gw_routers = [r.id for r in neutron.router_list(request) if (
                    r.external_gateway_info and
                    r.external_gateway_info.get('network_id') == ext_net_id)]

    all_gw_router_subnets = set()
    for gw_router in gw_routers:
        router_ports = neutron.router_port_list(request, gw_router)
        all_gw_router_subnets.update(set([port.fixed_ips[0]['subnet_id']
                                          for port in router_ports]))

    port_subnet = instance_port.fixed_ips[0]['subnet_id']
    if (port_subnet in all_gw_router_subnets):
        return True
    # share network can be bind, only check port subnets equal share subnets.
    share_nets = neutron.network_list(request, shared=True)
    share_subnets = []
    for net in share_nets:
        subnets = net['subnets']
        for subnet in subnets:
            share_subnets.append(subnet['id'])
    if port_subnet in share_subnets:
        return True
    return False


def security_group_list(request):
    return NetworkClient(request).secgroups.list()


def security_group_get(request, sg_id):
    return NetworkClient(request).secgroups.get(sg_id)


@base.create_log_decorator(optype='Create',
                           subject='Security Group', detail=None)
def security_group_create(request, name, desc):
    return NetworkClient(request).secgroups.create(name, desc)


def security_group_delete(request, sg_id):
    return NetworkClient(request).secgroups.delete(sg_id)


def security_group_update(request, sg_id, name, desc):
    return NetworkClient(request).secgroups.update(sg_id, name, desc)


def security_group_rule_create(request, parent_group_id,
                               direction, ethertype,
                               ip_protocol, from_port, to_port,
                               cidr, group_id):
    return NetworkClient(request).secgroups.rule_create(
        parent_group_id, direction, ethertype, ip_protocol,
        from_port, to_port, cidr, group_id)


def security_group_rule_delete(request, sgr_id):
    return NetworkClient(request).secgroups.rule_delete(sgr_id)


def server_security_groups(request, instance_id):
    return NetworkClient(request).secgroups.list_by_instance(instance_id)


def server_update_security_groups(request, instance_id,
                                  new_security_group_ids):
    return NetworkClient(request).secgroups.update_instance_security_group(
        instance_id, new_security_group_ids)


def security_group_backend(request):
    return NetworkClient(request).secgroups.backend


def servers_update_addresses(request, servers, all_tenants=False):
    """Retrieve servers networking information from Neutron if enabled.

       Should be used when up to date networking information is required,
       and Nova's networking info caching mechanism is not fast enough.

    """
    neutron_enabled = base.is_service_enabled(request, 'network')
    if neutron_enabled:
        neutron.servers_update_addresses(request, servers, all_tenants)
