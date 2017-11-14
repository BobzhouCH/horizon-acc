from _ast import keyword

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
"""API over the nova service.
"""
import json
import time
from datetime import datetime  # noqa
from datetime import timedelta  # noqa
from django import http
from django.http import HttpResponse
from django.conf import settings
from django.utils import http as utils_http
from django.views import generic
from django.template.defaultfilters import slugify
from horizon import exceptions
from django.utils.datastructures import SortedDict  # noqa
from django.utils.http import urlencode
from django.utils.translation import ugettext_lazy as _

from easystack_dashboard import api
from easystack_dashboard.api.rest import urls
from easystack_dashboard.api.rest import utils as rest_utils
from easystack_dashboard.api import keystone
from lenovo_dashboard.api import lenovo_uus as uus
import random, string

import logging
LOG = logging.getLogger(__name__)

LENOVO_FLAVOR_ENABLED = \
    getattr(settings, 'LENOVO_FLAVOR_ENABLED', False)
LENOVO_FLAVOR_CONFIG = \
    getattr(settings, 'LENOVO_FLAVOR_CONFIG', {
        'RAM_STEP': [
            [2, 4, 2],
            [3, 5, 3],
            [4, 6, 4],
            [5, 7, 5],
            [6, 7, 6],
            [0, 0, 0]
        ],
        'VOLUME_CONFIG': {
            'LINUX': [20, 30, 40],
            'WINDOWS': [100]
        }
    })


def filter_by_status(request, result):
    status = request.GET.getlist('status', None)
    if status:
        result = [item for item in result
                  if item['status'] in status]
    return result


@urls.register
class getLenovoFlavorConfig(generic.View):
    url_regex = r'nova/lenovoflavorconfig/$'

    @rest_utils.ajax()
    def get(self, request):
        if (LENOVO_FLAVOR_ENABLED):
            return LENOVO_FLAVOR_CONFIG
        else:
            return []


@urls.register
class Keypairs(generic.View):

    """API for nova keypairs.
    """
    url_regex = r'nova/keypairs/$'

    @rest_utils.ajax()
    @rest_utils.check_id_exist("fingerprint")
    def get(self, request):
        """Get a list of keypairs associated with the current logged-in
        account.

        The listing result is an object with property "items".
        """
        result = api.nova.keypair_list(request)
        return {'items': [u.to_dict().get('keypair') for u in result]}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a keypair.

        Create a keypair using the parameters supplied in the POST
        application/json object. The parameters are:

        :param name: the name to give the keypair
        :param public_key: (optional) a key to import

        This returns the new keypair object on success.
        """
        try:
            key_name = request.DATA['name']
            if 'public_key' in request.DATA:
                new = api.nova.keypair_import(request, key_name,
                                              request.DATA['public_key'])
            else:
                new = api.nova.keypair_create(request, key_name)
        except Exception as e:
            if hasattr(e, 'http_status'):
                http_status = e.http_status
                if http_status == 409:
                    msg = _("Key pair '%s' already exists.") % key_name
                    return http.HttpResponse(msg, status=http_status)
            raise
        return rest_utils.CreatedResponse(
            '/api/nova/keypairs/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )

    @rest_utils.ajax(data_required=True)
    def delete(self, request):
        """Delete keypairs by names.

        This method returns HTTP 204 (no content) on success.
        """
        names = request.DATA
        for name in names:
            api.nova.keypair_delete(request, name)


@urls.register
class KeypairS(generic.View):
    url_regex = r'nova/keypairs/(?P<keypair_name>.+)/$'

    def get(self, request, keypair_name):
        """Creates a new keypair and associates it to the current project.

        * Since the response for this endpoint creates a new keypair and
          is not idempotent, it normally would be represented by a POST HTTP
          request. However, this solution was adopted as it
          would support automatic file download across browsers.

        :param keypair_name: the name to associate the keypair to
        :param regenerate: (optional) if set to the string 'true',
            replaces the existing keypair with a new keypair

        This returns the new keypair object on success.
        """
        try:
            regenerate = request.GET.get('regenerate') == 'true'
            if regenerate:
                api.nova.keypair_delete(request, keypair_name)

            keypair = api.nova.keypair_create(request, keypair_name)

        except exceptions.Conflict:
            return HttpResponse(status=409)

        except Exception:
            return HttpResponse(status=500)

        else:
            response = HttpResponse(content_type='application/binary')
            response['Content-Disposition'] = ('attachment; filename=%s.pem'
                                               % slugify(keypair_name))
            response.write(keypair.private_key)
            response['Content-Length'] = str(len(response.content))

            return response



@urls.register
class Keypair(generic.View):

    """API for nova keypairs.
    """
    url_regex = r'nova/keypair/(?P<id>.+|default)$'

    @rest_utils.ajax()
    def delete(self, request, id):
        """Delete a single keypair by id.

        This method returns HTTP 204 (no content) on success.
        """
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        api.nova.keypair_delete(request, id)


@urls.register
class AvailabilityZones(generic.View):

    """API for nova availability zones.
    """
    url_regex = r'nova/availzones/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of availability zones.

        The following get parameters may be passed in the GET
        request:

        :param detailed: If this equals "true" then the result will
            include more detail.

        The listing result is an object with property "items".
        """
        detailed = request.GET.get('detailed') == 'true'
        result = api.nova.availability_zone_list(request, detailed)
        items = [u.to_dict() for u in result]
        default_az = getattr(settings, 'DEFAULT_AVAILABILITY_ZONE', None)
        if default_az is not None:
            for index in range(len(items)):
                if items[index].get('zoneName') == default_az:
                    temp_zone = items[index]
                    items[index] = items[0]
                    items[0] = temp_zone
                    break
        return {'items': items}


@urls.register
class Aggregates(generic.View):
    """API for nova aggregates.
    """
    url_regex = r'nova/aggregates/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of aggregates."""
        result = api.nova.aggregate_details_list(request)
        return {'items': [u.to_dict() for u in result]}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a aggregate."""
        keywords = ['name', 'availability_zone']
        filters, kwargs = rest_utils.parse_filters_kwargs(request, keywords)
        aggregate = api.nova.aggregate_create(request, **kwargs)
        return rest_utils.CreatedResponse(
            '/api/nova/aggregates/%s' % utils_http.urlquote(aggregate.id),
            aggregate.to_dict()
        )


@urls.register
class Aggregate(generic.View):
    """API for nova aggregate.
    """
    url_regex = r'nova/aggregates/(?P<aggregate_id>.+)/$'

    @rest_utils.ajax()
    def get(self, request, aggregate_id):
        """Get a aggregate by id."""
        result = api.nova.aggregate_get(request, aggregate_id)
        return result.to_dict()

    @rest_utils.ajax()
    def delete(self, request, aggregate_id):
        """Delete a single aggregate by id.
        """
        api.nova.aggregate_delete(request, aggregate_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, aggregate_id):
        """Edit a aggregate by id."""
        keywords = ['name', 'availability_zone']
        filters, values = rest_utils.parse_filters_kwargs(request, keywords)
        new = api.nova.aggregate_update(request, aggregate_id, values)
        return rest_utils.CreatedResponse(
            '/api/nova/server/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )

    @rest_utils.ajax(data_required=True)
    def post(self, request, aggregate_id):
        """Edit hosts of a aggregate: add_host/remove_host"""
        action = request.DATA['action']
        host = request.DATA['host']
        func = None
        if action == 'add_host':
            func = api.nova.add_host_to_aggregate
        elif action == 'remove_host':
            func = api.nova.remove_host_from_aggregate
        else:
            raise rest_utils.AjaxError(400, "bad action '%s'" % action)
        return func(request, aggregate_id, host).to_dict()


@urls.register
class Limits(generic.View):

    """API for nova limits.
    """
    url_regex = r'nova/limits/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get an object describing the current project limits.

        Note: the Horizon API doesn't support any other project (tenant) but
        the underlying client does...

        The following get parameters may be passed in the GET
        request:

        :param reserved: This may be set to "true" but it's not
            clear what the result of that is.

        The result is an object with limits as properties.
        """
        reserved = request.GET.get('reserved') == 'true'
        result = api.nova.tenant_absolute_limits(request, reserved)
        return result


@urls.register
class SnapshotCreate(generic.View):

    """API for nova snapshot
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/snapshotcreate$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, server_id):
        """Create a snapshot for a server.
        """
        try:
            snapshot_name = request.DATA['name']
            metadata = request.DATA.get('metadata', None)
        except KeyError as e:
            raise rest_utils.AjaxError(400, 'missing required parameter '
                                       "'%s'" % e.args[0])
        # nova return UUID of new image
        image_id = api.nova.snapshot_create(
            request, server_id, snapshot_name, metadata=metadata)
        new = api.glance.image_get(request, image_id)
        return rest_utils.CreatedResponse(
            '/api/nova/snapshots/%s' % utils_http.urlquote(new.id), new.to_dict())


@urls.register
class Servers(generic.View):

    """API over all servers.
    """
    url_regex = r'nova/servers/$'

    @rest_utils.ajax()
    @rest_utils.patch_items_by_func(rest_utils.ensure_all_flavor)
    @rest_utils.patch_items_by_func(filter_by_status)
    def get(self, request):
        if request.GET.get('all_tenants', False):
            result, has_more = api.nova.server_list(
                request,
                search_opts=request.GET.get('search_opts', None),
                all_tenants=request.GET.get('all_tenants', True),
            )
            items = []
            rest_utils.ensure_tenant_name(request, result)
            rest_utils.ensure_image_name(request, result)
            rest_utils.ensure_address_format(request, result)
            rest_utils.ensure_has_snapshot(request, result)
            for item in result:
                item_dict = item.to_dict()
                if hasattr(item, 'tenant_name'):
                    item_dict.update({'tenant_name': item.tenant_name})
                if hasattr(item, 'domain_id'):
                    item_dict.update({'domain_id': item.domain_id})
                if hasattr(item, 'image_display_name'):
                    item_dict.update(
                        {'image_display_name': item.image_display_name})
                if hasattr(item, 'ip_groups'):
                    item_dict.update({'ip_groups': item.ip_groups})
                if hasattr(item, 'has_snapshot'):
                    item_dict.update({'has_snapshot': item.has_snapshot})
                items.append(item_dict)
            rest_utils.ensure_domain_name(request, items)
            return dict(has_more=has_more, items=items)
        else:
            result, has_more = api.nova.server_list(
                request,
                search_opts=request.GET.get('search_opts', None),
                all_tenants=request.GET.get('all_tenants', False),
            )
            items = []
            rest_utils.ensure_image_name(request, result)
            rest_utils.ensure_address_format(request, result)
            rest_utils.ensure_has_snapshot(request, result)
            for item in result:
                item_dict = item.to_dict()
                if hasattr(item, 'image_display_name'):
                    item_dict.update(
                        {'image_display_name': item.image_display_name})
                if hasattr(item, 'ip_groups'):
                    item_dict.update({'ip_groups': item.ip_groups})
                if hasattr(item, 'has_snapshot'):
                    item_dict.update({'has_snapshot': item.has_snapshot})
                items.append(item_dict)
            return dict(has_more=has_more, items=items)

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a server.

        Create a server using the parameters supplied in the POST
        application/json object. The required parameters as specified by
        the underlying novaclient are:

        :param name: The new server name.
        :param source_id: The ID of the image to use.
        :param flavor_id: The ID of the flavor to use.
        :param key_name: (optional extension) name of previously created
                      keypair to inject into the instance.
        :param user_data: user data to pass to be exposed by the metadata
                      server this can be a file type object as well or a
                      string.
        :param security_groups: An array of one or more objects with a "name"
            attribute.

        Other parameters are accepted as per the underlying novaclient:
        "block_device_mapping", "block_device_mapping_v2", "nics", "meta",
        "availability_zone", "instance_count", "admin_pass", "disk_config",
        "config_drive"

        This returns the new server object on success.
        """
        parameters = [
            'name', 'source_id', 'flavor_id',
            'key_name', 'user_data', 'security_groups']
        optional_parameters = [
            'block_device_mapping', 'block_device_mapping_v2', 'nics',
            'meta', 'availability_zone', 'instance_count', 'admin_pass',
            'disk_config', 'config_drive', 'scheduler_hints']
        if 'policy_target_group_id' in request.DATA:
            ptg_id = request.DATA['policy_target_group_id']

        args = rest_utils.parse_args(request, parameters)
        flt, kw = rest_utils.parse_filters_kwargs(request,
                                                  optional_parameters)
        if api.keystone.is_dedicated_context(request):
            kw['availability_zone'] = api.keystone.get_default_domain(
                request).id
        # create port from subnet
        ports_manager = Servers.PortsIniter(request, kw.get('nics'),
                                            flt.get('security_groups'))
        kw['nics'] = ports_manager.create_ports_from_subnets()

        # if ptg_id:
        #     pt_list = api.gbp.pt_list(request, request.user.tenant_id)
        #     pt_count = len([pt for pt in pt_list
        #                     if pt['policy_target_group_id'] == ptg_id])
        #     policy_target = api.gbp.pt_create(
        #         request,
        #         policy_target_group_id=ptg_id,
        #         name='pt-' + str(ptg_id) + "-" + str(pt_count+1)
        #     )
        #     kw['nics'] = [{'port-id': policy_target.id}]

        try:
            server = api.nova.server_create(request, *args, **kw)
        except Exception:
            # free ports while created failed.
            ports_manager.rollback_created_ports()
            raise

        return rest_utils.CreatedResponse(
            '/api/nova/servers/%s' % utils_http.urlquote(server.id),
            server.to_dict()
        )

    class PortsIniter(object):

        def __init__(self, request, nics, security_groups):
            self.request = request
            self.nics = nics or []
            self.security_groups = security_groups or []
            self.created_ports = []

        def create_ports_from_subnets(self):
            self.created_ports = []
            to_create_nics = []
            # update the nics to convert the subnet-id to port-id
            for nic in self.nics:
                net_id = nic.get('net-id')
                port_id = nic.get('port-id')
                subnet_id = nic.get('subnet-id')
                ipv4 = nic.get('v4-fixed-ip')
                if port_id:
                    to_create_nics.append(nic)
                    continue
                if subnet_id:
                    # NOTE(lzm): the security group is required when port
                    # creating, because the security group will not be used
                    # when creating instance with port-id.
                    fixed_ip = {'subnet_id': subnet_id}
                    if ipv4:
                        fixed_ip['ip_address'] = ipv4
                    #create a defaule name for port
                    port_name = 'nic_' + str(time.time())
                    port_params = {'fixed_ips': [fixed_ip],
                                   'security_groups': self.security_groups,
                                   'name': port_name}
                    port = api.neutron.port_create(self.request, net_id,
                                                   **port_params)
                    to_create_nics.append({'port-id': port.id})
                    self.created_ports.append(port.id)
                else:
                    to_create_nics.append({'net-id':net_id})
            return to_create_nics

        def rollback_created_ports(self):
            for port in self.created_ports:
                api.neutron.port_delete(self.request, port)
            self.created_ports = []


# this class add to resolve the ironic deploy instance condition
@urls.register
class BareMetalServers(generic.View):

    """API over all servers.
    """
    url_regex = r'nova/baremetalservers/$'

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a server.

        Create a server using the parameters supplied in the POST
        application/json object. The required parameters as specified by
        the underlying novaclient are:

        :param name: The new server name.
        :param source_id: The ID of the image to use.
        :param flavor_id: The ID of the flavor to use.
        :param key_name: (optional extension) name of previously created
                      keypair to inject into the instance.
        :param user_data: user data to pass to be exposed by the metadata
                      server this can be a file type object as well or a
                      string.
        :param security_groups: An array of one or more objects with a "name"
            attribute.

        Other parameters are accepted as per the underlying novaclient:
        "block_device_mapping", "block_device_mapping_v2", "nics", "meta",
        "availability_zone", "instance_count", "admin_pass", "disk_config",
        "config_drive"

        This returns the new server object on success.
        """
        parameters = [
            'name', 'source_id', 'flavor_id',
            'key_name', 'user_data', 'security_groups']
        optional_parameters = [
            'block_device_mapping', 'block_device_mapping_v2', 'nics',
            'meta', 'availability_zone', 'instance_count', 'admin_pass',
            'disk_config', 'config_drive']
        if 'policy_target_group_id' in request.DATA:
            ptg_id = request.DATA['policy_target_group_id']

        args = rest_utils.parse_args(request, parameters)
        flt, kw = rest_utils.parse_filters_kwargs(request,
                                                  optional_parameters)
        if api.keystone.is_dedicated_context(request):
            kw['availability_zone'] = api.keystone.get_default_domain(
                request).id
        # create port from subnet
        pre_manager = BareMetalServers.BarePortFlavorIniter(request, kw.get('nics'),
                                            flt.get('flavor_id'))
        # replace the flavor_id to the resl flavor id
        args[2] = pre_manager.create_ironic_flavor_from_node(request)
        kw['nics'] = pre_manager.create_ironic_ports_from_subnets(request)

        # if ptg_id:
        #     pt_list = api.gbp.pt_list(request, request.user.tenant_id)
        #     pt_count = len([pt for pt in pt_list
        #                     if pt['policy_target_group_id'] == ptg_id])
        #     policy_target = api.gbp.pt_create(
        #         request,
        #         policy_target_group_id=ptg_id,
        #         name='pt-' + str(ptg_id) + "-" + str(pt_count+1)
        #     )
        #     kw['nics'] = [{'port-id': policy_target.id}]

        try:
            server = api.nova.ironic_server_create(request, *args, **kw)
        except Exception:
            # free ports while created failed.
            pre_manager.rollback_created_ports()
            pre_manager.rollback_created_flavor()
            raise

        return rest_utils.CreatedResponse(
            '/api/nova/servers/%s' % utils_http.urlquote(server.id),
            server.to_dict()
        )

    class BarePortFlavorIniter(object):

        def __init__(self, request, nics, node):
            self.request = request
            self.nics = nics or []
            self.node = node or []
            self.created_ports = []
            self.created_flavor = ''

        def create_ironic_ports_from_subnets(self, request):
            self.created_ports = []
            to_create_nics = []
            # update the nics to convert the subnet-id to port-id
            for nic in self.nics:
                net_id = nic.get('net-id')
                port_id = nic.get('port-id')
                subnet_id = nic.get('subnet-id')
                ipv4 = nic.get('v4-fixed-ip')
                # if the port, just transfer the port
                if port_id:
                    to_create_nics.append(nic)
                    continue
                # if private net, create the port first, then transfer the port
                if subnet_id:
                    # NOTE(lzm): the security group is required when port
                    # creating, because the security group will not be used
                    # when creating instance with port-id.
                    fixed_ip = {'subnet_id': subnet_id}
                    if ipv4:
                        fixed_ip['ip_address'] = ipv4
                    #create a defaule name for port
                    port_name = 'nic_' + str(time.time())
                    ports = api.ironic.node_list_ports(request, self.node)
                    # TODO : consider one port condition now , multiple ports condition later
                    if ports:
                        mac_address = getattr(api.ironic.node_list_ports(request, self.node)[0], 'address')
                    # if there is not any ports , it proves that the node has not bind the nic,it should return err.
                    else:
                        return
                    port_params = {'fixed_ips': [fixed_ip],
                                   'mac_address': mac_address,
                                   'name': port_name}
                    port = api.neutron.port_create(self.request, net_id,
                                                   **port_params)
                    to_create_nics.append({'port-id': port.id})
                    self.created_ports.append(port.id)
                # if share net, just transfer the net-id
                else:
                    to_create_nics.append({'net-id':net_id})
            return to_create_nics

        def rollback_created_ports(self):
            for port in self.created_ports:
                api.neutron.port_delete(self.request, port)
            self.created_ports = []

        def create_ironic_flavor_from_node(self, request):
            self.created_flavor = []
            to_create_flavor = []
            # fetch the node detail
            node = api.ironic.node_get(request, self.node)

            prop = getattr(node, 'properties')
            # these parameters definated for flavor creating
            vcpu = prop['cpus']
            memory = prop['memory_mb']
            disk = prop['local_gb']
            name = 'ironic' + '-' + str(prop['cpus']) + '-' + str(prop['memory_mb']) + '-' + str(prop['local_gb']) + random_str(8)
            flavor = api.nova.flavor_create(request, name , memory, vcpu, disk)
            self.created_flavor = flavor.id
            return flavor.id

        def rollback_created_flavor(self):
            api.nova.flavor_delete(self.request, self.created_flavor)
            self.created_flavor = ''


@urls.register
class Server(generic.View):

    """API for retrieving a single server
    """
    url_regex = r'nova/servers/(?P<server_id>.+|default)/$'

    @rest_utils.ajax()
    def get(self, request, server_id):
        """Get a specific server

        http://localhost/api/nova/servers/1
        """
        item = api.nova.server_get(request, server_id)

        item_dict = item.to_dict()
        rest_utils.ensure_up_time(request, item_dict)
        rest_utils.ensure_single_volumes(request, item_dict)
        rest_utils.ensure_single_flavor(request, item_dict)
        rest_utils.ensure_single_image_name(request, item_dict)
        rest_utils.ensure_single_address_format(request, item_dict)
        return item_dict

    @rest_utils.ajax()
    def delete(self, request, server_id):
        """Delete a single server by id.

        This method returns HTTP 204 (no content) on success.
        """
        relate_port = []
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        api.nova.server_delete(request, server_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, server_id):
        new = api.nova.server_update(request,
                                     server_id,
                                     name=request.DATA.get('name'))
        return rest_utils.CreatedResponse(
            '/api/nova/server/%s' % utils_http.urlquote(new.name),
            new.to_dict()
        )


# add this class to manage the condition where ironic instance is deleting
# ironic vm deleting procedure is different form common vms
@urls.register
class BareMetalServer(generic.View):

    """API for retrieving a single server
    """
    url_regex = r'nova/baremetalservers/(?P<server_id>.+|default)/$'

    @rest_utils.ajax()
    def delete(self, request, server_id):
        """Delete a single server by id.

        This method returns HTTP 204 (no content) on success.
        """
        kwargs = {'device_id': server_id}
        relate_port = api.neutron.port_list(request, **kwargs)

        for p in relate_port:
            api.neutron.port_delete(request,getattr(p, 'id'))

        api.nova.server_delete(request, server_id)


@urls.register
class ServerVNC(generic.View):

    """API for server vnc
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/vnc$'

    @rest_utils.ajax()
    def get(self, request, server_id):
        console = api.nova.server_vnc_console(request, server_id)
        console_url = "%s&%s(%s)" % (
            console.url,
            urlencode({'title': ""}),
            server_id)
        return console_url


@urls.register
class ServerConsoleOutput(generic.View):

    """API for server vnc
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/consoleoutput$'

    @rest_utils.ajax()
    def get(self, request, server_id):
        tail_len = request.GET.get('tail_length', 30)
        output = api.nova.server_console_output(request, server_id, tail_len)
        if output == '':
            output = '\n'
        else:
            need_br = int(tail_len) - 1
            has_br = output.count('\n')
            count_br = need_br - has_br
            if output.endswith('\n'):
                count_br = count_br + 1
            output = output + count_br*('\n')
        return output


@urls.register
class ServerPause(generic.View):

    """API for pause server
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/pause$'

    @rest_utils.ajax()
    def post(self, request, server_id):
        api.nova.server_pause(request, server_id)


@urls.register
class ServerUnpause(generic.View):

    """API for unpause server
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/unpause$'

    @rest_utils.ajax()
    def post(self, request, server_id):
        api.nova.server_unpause(request, server_id)


@urls.register
class ServerSuspend(generic.View):

    """API for suspend server
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/suspend$'

    @rest_utils.ajax()
    def post(self, request, server_id):
        api.nova.server_suspend(request, server_id)


@urls.register
class ServerSoftReboot(generic.View):

    """API for soft reboot server
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/softreboot$'

    @rest_utils.ajax()
    def post(self, request, server_id):
        api.nova.server_reboot(request, server_id, soft_reboot=True)


@urls.register
class ServerResume(generic.View):

    """API for resume server
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/resume$'

    @rest_utils.ajax()
    def post(self, request, server_id):
        api.nova.server_resume(request, server_id)


@urls.register
class ServerRebuild(generic.View):

    """API for rebuild server
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/rebuild$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, server_id):
        api.nova.server_rebuild(request,
                                server_id,
                                image_id=request.DATA.get('image_id'),
                                password=request.DATA.get('password'))


@urls.register
class ServerMigrate(generic.View):

    """API for migrate server
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/migrate'

    @rest_utils.ajax()
    def post(self, request, server_id):
        api.nova.server_migrate(request, server_id)


@urls.register
class ServerLiveMigrate(generic.View):

    """API for live migrate server
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/livemigrate'

    @rest_utils.ajax(data_required=True)
    def post(self, request, server_id):
        api.nova.server_live_migrate(
            request,
            server_id,
            host=request.DATA.get('host'),
            block_migration=request.DATA.get('block_migrate', False),
            disk_over_commit=request.DATA.get('disk_over_commit', False))


@urls.register
class ServerMemoryBalloon(generic.View):
    """API for setting/getting actual memory for server
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/actual_total_memory'

    @rest_utils.ajax(data_required=True)
    def patch(self, request, server_id):
        api.nova.server_set_actual_total_memory(request,
                                                server_id,
                                                request.DATA['size'],
                                                request.DATA['granularity'])
        return {'Success': 'True'}

    @rest_utils.ajax(data_required=False)
    def get(self, request, server_id):
        return api.nova.server_get_actual_total_memory(request, server_id)


@urls.register
class ServerHotExtendVDisk(generic.View):
    """API for hot extending the vDisk in server
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/root_device'

    @rest_utils.ajax(data_required=True)
    def patch(self, request, server_id):
        result = {'Error': 'Undefined request'}

        if 'hot_extend' in request.DATA:
            result = api.nova.server_hot_extend_root_device(request,
                                                            server_id,
                                                            request.DATA['hot_extend']['size'],
                                                            request.DATA['hot_extend']['granularity'])
        return result


@urls.register
class ServerResize(generic.View):

    """API for resize server
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/resize'

    @rest_utils.ajax(data_required=True)
    def post(self, request, server_id):
        api.nova.server_resize(
            request,
            server_id,
            flavor=request.DATA.get('flavor')
        )


@urls.register
class ServerConfirmResize(generic.View):

    """API for confirm resize server
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/confirm_resize'

    @rest_utils.ajax()
    def post(self, request, server_id):
        api.nova.server_confirm_resize(
            request,
            server_id
        )


@urls.register
class ServerRevertResize(generic.View):

    """API for revirt resize server
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/revert_resize'

    @rest_utils.ajax()
    def post(self, request, server_id):
        api.nova.server_revert_resize(
            request,
            server_id
        )


@urls.register
class ServerStart(generic.View):

    """API for start server
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/start'

    @rest_utils.ajax()
    def post(self, request, server_id):
        api.nova.server_start(request, server_id)


@urls.register
class ServerStop(generic.View):

    """API for stop server
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/stop'

    @rest_utils.ajax()
    def post(self, request, server_id):
        api.nova.server_stop(request, server_id)


@urls.register
class ServerNetworkAssociate(generic.View):

    """API for assoicate server with network
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/netassociate'

    @rest_utils.ajax(data_required=True)
    def post(self, request, server_id):
        subnet_id = request.DATA.get('subnet_id', None)
        network_id = request.DATA.get('network_id', None)
        if subnet_id:
            port_params = {"fixed_ips": [{"subnet_id": subnet_id}]}
            port = api.neutron.port_create(request,
                                           network_id=network_id,
                                           ** port_params)
            try:
                api.nova.interface_attach(
                    request,
                    server=server_id,
                    port_id=port.id
                )
            except Exception:
                # delete port while attached failed.
                api.neutron.port_delete(request, port.id)
                raise
        else:
            api.nova.interface_attach(
                request,
                server=server_id,
                port_id=request.DATA.get('port_id', None),
                net_id=request.DATA.get('network_id', None),
                fixed_ip=request.DATA.get('fixed_ip', None)
            )


@urls.register
class ServerNetworkDisassociate(generic.View):

    """API for disassoicate server with network
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/netdisassociate'

    @rest_utils.ajax(data_required=True)
    def post(self, request, server_id):
        api.nova.interface_detach(
            request,
            server=server_id,
            port_id=request.DATA.get('port_id')
        )


@urls.register
class ServerVolumeAttach(generic.View):

    """API for attach server with volume
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/volattach'

    @rest_utils.ajax(data_required=True)
    def post(self, request, server_id):
        api.nova.instance_volume_attach(
            request,
            instance_id=server_id,
            volume_id=request.DATA.get('volume_id'),
            device=request.DATA.get('device')
        )


@urls.register
class ServerVolumeDettach(generic.View):

    """API for dettach server with volume
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/voldetach'

    @rest_utils.ajax(data_required=True)
    def post(self, request, server_id):
        api.nova.instance_volume_detach(
            request,
            instance_id=server_id,
            att_id=request.DATA.get('volume_id')
        )


@urls.register
class ServerVolumes(generic.View):

    """API for list server volumes
    """
    url_regex = r'nova/servers/(?P<server_id>.+)/volumes'

    def patch_vlume_names(self, request, result):
        for item in result['items']:
            volume = api.cinder.volume_get(request, item['volumeId'])
            item['volumeName'] = volume.name
        return result

    @rest_utils.ajax()
    def get(self, request, server_id):
        volumes = api.nova.instance_volumes_list(request, server_id)
        result = {'items': [e.to_dict() for e in volumes]}
        return self.patch_vlume_names(request, result)


@urls.register
class Hypervisors(generic.View):

    """API for hypervisors.
    """
    url_regex = r'nova/hypervisors/(?P<host_name>.+|)$'

    @rest_utils.ajax()
    def get(self, request, host_name):
        if host_name == 'All':
            result = api.nova.hypervisor_list(request)
        else:
            result = api.nova.hypervisor_search(request, host_name)
        return {'items': [e.to_dict() for e in result]}


#begin:jiaozh1:add:2016-11-22:bug:Bugzilla - bug 75256
@urls.register
class Hypervisorsformigrate(generic.View):

    """API for hypervisors migrate.
    """
    url_regex = r'nova/hypervisorsformigrate/(?P<server_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, server_id):

        result = api.nova.hypervisor_list(request, server_id = server_id)
        return {'items': [e.to_dict() for e in result]}
#end:jiaozh1:add:2016-11-22:bug:Bugzilla - bug 75256


@urls.register
class Extensions(generic.View):

    """API for nova extensions.
    """
    url_regex = r'nova/extensions/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of extensions.

        The listing result is an object with property "items". Each item is
        an image.

        Example GET:
        http://localhost/api/nova/extensions
        """
        result = api.nova.list_extensions(request)
        return {'items': [e.to_dict() for e in result]}


@urls.register
class Services(generic.View):

    """API for nova services.
    """
    url_regex = r'nova/services/$'

    @rest_utils.ajax()
    def get(self, request):
        binary = request.GET.get('binary')
        result = api.nova.service_list(request, binary=binary)
        return {'items': [e.to_dict() for e in result]}


@urls.register
class ServiceEnable(generic.View):

    """API for nova service enable.
    """
    url_regex = r'nova/services/(?P<node_id>.+)/enable'

    @rest_utils.ajax(data_required=True)
    def post(self, request, node_id):
        result = api.nova.service_enable(request,
                                         node_id,
                                         binary=request.DATA.get('binary'))
        return result.to_dict()


@urls.register
class ServiceDisable(generic.View):

    """API for nova service disable.
    """
    url_regex = r'nova/services/(?P<node_id>.+)/disable'

    @rest_utils.ajax(data_required=True)
    def post(self, request, node_id):
        result = api.nova.service_disable(request,
                                          node_id,
                                          binary=request.DATA.get('binary'),
                                          reason=request.DATA.get('reason'))
        return result.to_dict()


@urls.register
class Flavors(generic.View):

    """API for nova flavors.
    """
    url_regex = r'nova/flavors/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of flavors.

        The listing result is an object with property "items". Each item is
        an flavor. By default this will return the flavors for the user's
        current project. If the user is admin, public flavors will also be
        returned.

        :param is_public: For a regular user, set to True to see all public
            flavors. For an admin user, set to False to not see public flavors.
        :param get_extras: Also retrieve the extra specs.

        Example GET:
        http://localhost/api/nova/flavors?is_public=true
        """
        is_public = request.GET.get('is_public')
        is_public = (is_public and is_public.lower() == 'true')
        get_extras = request.GET.get('get_extras')
        get_extras = bool(get_extras and get_extras.lower() == 'true')
        flavors = api.nova.flavor_list(request, is_public=is_public,
                                       get_extras=get_extras)
        result = {'items': []}
        for flavor in flavors:
            d = flavor.to_dict()
            if get_extras:
                d['extras'] = flavor.extras
            result['items'].append(d)
        return result

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        flavor_access = request.DATA.get('flavor_access', [])
        flavor_id = request.DATA['id']
        is_public = not flavor_access

        flavor = api.nova.flavor_create(request,
                                        name=request.DATA['name'],
                                        memory=request.DATA['ram'],
                                        vcpu=request.DATA['vcpus'],
                                        disk=request.DATA['disk'],
                                        ephemeral=request
                                        .DATA['OS-FLV-EXT-DATA:ephemeral'],
                                        swap=request.DATA['swap'],
                                        flavorid=flavor_id,
                                        is_public=is_public,
                                        rxtx_factor=request.DATA['rxtx_factor']
                                        )

        for project in flavor_access:
            api.nova.add_tenant_to_flavor(
                request, flavor.id, project.get('id'))

        return rest_utils.CreatedResponse(
            '/api/nova/flavors/%s' % flavor.id,
            flavor.to_dict()
        )


@urls.register
class BareMetalFlavors(generic.View):

    """API for nova flavors.
    """
    url_regex = r'nova/baremetalflavors/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of flavors.

        The listing result is an object with property "items". Each item is
        an flavor. By default this will return the flavors for the user's
        current project. If the user is admin, public flavors will also be
        returned.

        :param is_public: For a regular user, set to True to see all public
            flavors. For an admin user, set to False to not see public flavors.
        :param get_extras: Also retrieve the extra specs.

        Example GET:
        http://localhost/api/nova/flavors?is_public=true
        """
        is_public = request.GET.get('is_public')
        is_public = (is_public and is_public.lower() == 'true')
        flavors = api.nova.flavor_list(request, is_public=is_public,
                                       get_extras=True)
        result = {'items': []}
        for flavor in flavors:
            d = flavor.to_dict()
            d['extras'] = flavor.extras
            if('baremetal_count' in d['extras']):
                result['items'].append(d)

        return result


@urls.register
class AllFlavors(generic.View):

    """API for nova flavors.
    """
    url_regex = r'nova/allflavors/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of all flavors.

        The listing result is an object with property "items". Each item is
        an flavor. By default this will return the flavors for the user's
        current project. If the user is admin, public flavors will also be
        returned.

        :param is_public: For a regular user, set to True to see all public
            flavors. For an admin user, set to False to not see public flavors.
        :param get_extras: Also retrieve the extra specs.

        Example GET:
        http://localhost/api/nova/flavors?
        """
        get_extras = request.GET.get('get_extras')
        get_extras = bool(get_extras and get_extras.lower() == 'true')
        pubFlavors = api.nova.flavor_list(request, is_public=True,
                                       get_extras=get_extras)
        priFlavors = api.nova.flavor_list(request, is_public=False,
                                       get_extras=get_extras)
        result = {'items': []}
        # pub flavors
        for flavor in pubFlavors:
            d = flavor.to_dict()
            if get_extras:
                d['extras'] = flavor.extras
            result['items'].append(d)
        # pri flavors
        for flavor in priFlavors:
            #begin:jiaozh1:add:2016-12-02:bug:Bugzilla - bug 75379
            items = [x for x in result['items'] if x['id'] == flavor.id]
            if len(items) > 0:
                continue
            #end:jiaozh1:add:2016-11-02:bug:Bugzilla - bug 75379
            d = flavor.to_dict()
            if get_extras:
                d['extras'] = flavor.extras
            result['items'].append(d)

        return result


@urls.register
class Flavor(generic.View):

    """API for retrieving a single flavor
    """
    url_regex = r'nova/flavors/(?P<flavor_id>.+)/$'

    @rest_utils.ajax()
    def get(self, request, flavor_id):
        """Get a specific flavor

        :param get_extras: Also retrieve the extra specs.

        Example GET:
        http://localhost/api/nova/flavors/1
        """
        get_extras = request.GET.get('get_extras')
        get_extras = bool(get_extras and get_extras.lower() == 'true')
        flavor = api.nova.flavor_get(request, flavor_id, get_extras=get_extras)
        result = flavor.to_dict()
        # the following is an admin api, normal user can't get flavor
        #projects = api.keystone.dedicated_tenant_list(request)
        #projects_dicts = SortedDict([(p.id, p) for p in projects[0]])
        if get_extras:
            result['extras'] = flavor.extras
        #if result['os-flavor-access:is_public'] == False:
        #    access_list = api.nova.flavor_access_list(request, result['id'])
        #    flavor_access = []
        #    for access in access_list:
        #        flavor_access_dict = {}
        #        name = projects_dicts.get(access.tenant_id).name
        #        id = access.tenant_id
        #        flavor_access_dict.update({'name': name, 'id': id})
        #        flavor_access.append(flavor_access_dict)
        #    result['flavor_access'] = flavor_access
        return result

    @rest_utils.ajax()
    def delete(self, request, flavor_id):
        api.nova.flavor_delete(request, flavor_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, flavor_id):
        flavor_access = request.DATA.get('flavor_access', [])
        is_public = not flavor_access

        # Grab any existing extra specs, because flavor edit is currently
        # implemented as a delete followed by a create.
        extras_dict = api.nova.flavor_get_extras(request, flavor_id, raw=True)
        # Mark the existing flavor as deleted.
        api.nova.flavor_delete(request, flavor_id)
        # Then create a new flavor with the same name but a new ID.
        # This is in the same try/except block as the delete call
        # because if the delete fails the API will error out because
        # active flavors can't have the same name.
        flavor = api.nova.flavor_create(request,
                                        name = request.DATA['name'],
                                        memory = request.DATA['ram'],
                                        vcpu = request.DATA['vcpus'],
                                        disk = request.DATA['disk'],
                                        ephemeral = request
                                        .DATA['OS-FLV-EXT-DATA:ephemeral'],
                                        swap = request.DATA['swap'],
                                        flavorid = flavor_id,
                                        is_public = is_public,
                                        rxtx_factor = request.DATA['rxtx_factor']
                                        )
        for project in flavor_access:
                     api.nova.add_tenant_to_flavor(
                         request, flavor.id, project.get('id'))

        if extras_dict:
            api.nova.flavor_extra_set(request, flavor.id, extras_dict)

#Modify for NFVI, 2016-12-27,-- Begin
@urls.register
class FlavorExtraSpecs(generic.View):

    """API for managing flavor extra specs
    """
    url_regex = r'nova/flavors/(?P<flavor_id>.+)/extra-specs$'

    @rest_utils.ajax()
    def get(self, request, flavor_id):
        """Get a specific flavor's extra specs

        Example GET:
        http://localhost/api/nova/flavors/1/extra-specs
        """
        return api.nova.flavor_get_extras(request, flavor_id, raw=True)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, flavor_id):
        """Update a specific flavor's extra specs.
       

        This method returns HTTP 204 (no content) on success.
        """

        LOG.info("flavor_extra_delete = %s" % request.DATA.get('removed'))
        if request.DATA.get('removed'):
            api.nova.flavor_extra_delete(
                request, flavor_id, request.DATA.get('removed')
            )
        api.nova.flavor_extra_set(
            request, flavor_id, request.DATA['updated']
        )
#Modify for NFVI, 2016-12-27,-- End

@urls.register
class NovaUsage(generic.View):

    """API for nova usage
    """
    url_regex = r'nova/usage/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get all tenants nova usages.

        """
        from_time = datetime.now() - timedelta(days=365)
        to_time = datetime.now()
        usage = api.nova.usage_list(request,
                                    from_time,
                                    to_time)
        # add tenant_name, if tenant was deleted  use "tenant_id('deleted')
        rest_utils.ensure_tenant_name_in_usages(request, usage)

        items = []
        for item in usage:
            item_dict = item.to_dict()
            if item.tenant_name:
                item_dict['tenant_name'] = item.tenant_name
            if item.domain_id:
                item_dict['domain_id'] = item.domain_id
            items.append(item_dict)
        rest_utils.ensure_domain_name(request, items)
        return {'items': items}


@urls.register
class ServerGroup(generic.View):
    """API for nova server groups.
    """
    url_regex = r'nova/servergroups/(?P<sg_id>.+)/$'

    @rest_utils.ajax()
    def get(self, request, sg_id):
        result = api.nova.server_group_get(request, sg_id)
        return result.to_dict()

    @rest_utils.ajax()
    def delete(self, request, sg_id):
        api.nova.server_group_delete(request, sg_id)
        return sg_id


@urls.register
class ServerGroups(generic.View):
    """API for nova server groups.
    """
    url_regex = r'nova/servergroups/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of server groups.

        The listing result is an object with property "items".
        """
        all_projects = False
        if request.GET.get('all_projects', False):
            all_projects = True
        result = api.nova.server_group_list(request, all_projects)
        return {'items': [u.to_dict() for u in result]}

    @rest_utils.ajax()
    def post(self, request):
        name =  request.DATA['name']
        policy = request.DATA['policy']
        result = api.nova.server_group_create(request,
                                              name=name,
                                              policies=[policy])
        return result.to_dict()


# Modify for NFVI-PSSR, -- Begin
@urls.register
class PssrGetPorts(generic.View):

        """API for managing pssr
        """
        url_regex = r'nova/lenovoports/(?P<hostname>.+)/(?P<hostip>.+)$'

        @rest_utils.ajax()
        def get(self,  request , hostname,hostip):
            results = api.nova.pssr_get_ports(request,hostname)
            LOG.info("PssrGetPorts:results = %s" % results)
            return results

@urls.register
class PssrGetIntfs(generic.View):

        """API for managing pssr
        """
        url_regex = r'nova/lenovointerfaces/(?P<hostname>.+)' #/(?P<hostip>.+)$'

        @rest_utils.ajax()
        def get(self,  request , hostname ):
	    LOG.info("PssrGetIntfs,request.DATA = %s" % request.DATA)
            results = api.nova.pssr_get_intfs(request,hostname)
            LOG.info("PssrGetIntfs:results = %s" % results)
            return results

@urls.register
class NfviPssrConf(generic.View):
            """API for managing pssr
            """
            url_regex = r'nova/lenovointerfaceconfigsupload/(?P<hostname>.+)/(?P<hostip>.+)/(?P<interface_id>.+)$'

            @rest_utils.ajax()
	    def post(self, request, hostname,hostip,interface_id):
		LOG.info("NfviPssrConf,request.DATA = %s" % request.DATA)
                LOG.info("network_type = %s " % request.DATA['network_type'])
                LOG.info("vfnum = %s " % request.DATA['vfnum'])
                LOG.info("hostname = %s ,hostip = %s" % (hostname,hostip))
                LOG.info("interface_id = %s " % interface_id)


                request2 = {
                    "name": request.DATA['name'],
                    "network_type": request.DATA['network_type'],
                    "ports": [request.DATA['name']],
                    "vfnum": request.DATA['vfnum'],
                    "provider_networks": request.DATA['provider_networks'],
		    "physerver":hostname,
		    "physerver_ip":hostip		
                }
                results = api.nova.pssr_conf(request,request2)
                LOG.info("NfviPssrConf:results = %s" % results)
                return results	            


@urls.register
class PssrGetProvider(generic.View):
                """API for managing pssr
                """
                url_regex = r'nova/lenovoprovidernetworks/(?P<hostname>.+)/(?P<hostip>.+)$'

                @rest_utils.ajax()
                def get(self, request, hostname , hostip):
                    results = ["physnet2"]
                    LOG.info("PssrGetProvider:results = %s" % results)
                    return results

@urls.register
class PssrGetIntfConf(generic.View):
                    """API for managing pssr
                    """
                    # '/api/nova/lenovoports/' + physicalMachineId
                    url_regex = r'nova/lenovointerfaceconfigs/(?P<hostname>.+)/(?P<hostip>.+)/(?P<interface_name>.+)$'

                    @rest_utils.ajax()
                    def get(self, request,hostname ,hostip,interface_name):
    	                results = api.nova.pssr_get_intf_conf(request , hostname, interface_name)
                        LOG.info("PssrGetIntfConf:results = %s" % results)
                        return results

@urls.register
class PssrGetPortConf(generic.View):
                    """API for managing pssr
                    """
                    # '/api/nova/lenovoports/' + physicalMachineId
                    url_regex = r'nova/lenovointerfaceports/(?P<hostname>.+)/(?P<hostip>.+)/(?P<interface_name>.+)$'

                    @rest_utils.ajax()
                    def get(self, request,hostname ,hostip,interface_name):
                        results = [api.nova.pssr_get_port_conf(request, hostname,interface_name)]
                        LOG.info("PssrGetPortConf:results = %s" % results)
                        return results

@urls.register
class PssrGetPFVFNumConfigured(generic.View):
    """API for managing pssr
    """
    # '/api/nova/pssrgetpfvfnum/' + physnet
    url_regex = r'nova/pssrgetpfvfnum/(?P<physnet>.+)$'

    @rest_utils.ajax()
    def get(self, request, physnet):
        """pssr"""
        results = api.nova.pssr_get_pfvf_num_configured(request, physnet)
        LOG.info("PssrGetPFVFNum:results = %s" % results)
        return results

## added by laixf 2017/3/10 for Lock Unlock feature
@urls.register
class HostLock(generic.View):
    url_regex =  r'nova/host/(?P<node_name>[^/]+)/lock$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, node_name):

        #node_domain_name='%s%s'%(str(node_name),".domain.tld")
        node_domain_name=node_name
        action = request.DATA.get('action', 'none')
        LOG.info("host lock node:%s Action:%s" % (node_name,action))
        client = uus.client()
       
        result = {}
        if action == 'Unlock':
           
            service_info = api.nova.service_state(request, node_domain_name, binary='nova-compute')
            if len(service_info)== 0:
                result ={"status": "failed", "msg": "Cannot get the service state"}
                return result
            service_state= getattr(service_info[0],'state','')
            service_status =getattr(service_info[0],'status','')
            #LOG.info("host:%s,state:%s,status:%s" %(node_domain_name,service_state,service_status))
            if service_state == '':
                result ={"status": "failed", "msg": "Cannot get service state"}
                client.change_host(node_name, "Locked") 
            elif service_state == "down":
                result ={"status": "failed", "msg": "Node is offline"}
                client.change_host(node_name, "Locked")
            elif service_status =='enabled':
                result ={"status": "success", "msg": "Successfully unlocked"}
                client.change_host(node_name, "Unlocked")
            elif service_status=="disabled":
                resp=api.nova.service_enable(request,node_domain_name,binary= 'nova-compute')
                service_status = getattr(resp,'status','')
                if service_status == 'enabled':
                    ###lighttpd  POST http://127:0.0.1:9080/openstack/?operation=change_state
                    result ={"status": "success", "msg": "Successfully unlocked"}
                    client.change_host(node_name, "Unlocked")
                else :
                    result ={"status": "failed", "msg": "Cannot enable service"}
                    client.change_host(node_name, "Locked")
                    
            else :
                 result ={"status": "error", "msg": "Unknown node state"}
                 
        elif action == 'Lock':
            
            service_info = api.nova.service_state(request, node_domain_name, binary='nova-compute')
            #LOG.info("host:%s,length of service:%d " %(node_domain_name, len(service_info)))
            if len(service_info) == 0:
                 result ={"status": "failed", "msg": "Only support compute node's lock"}
                 client.change_host(node_name, "Unlocked")
            else:
                 service_state= getattr(service_info[0],'state','')
                 service_status =getattr(service_info[0],'status','')
                 LOG.info("host:%s,state:%s,status:%s" %(node_domain_name,service_state,service_status))
                 search_opts={'host':node_domain_name, 'all_tenants':True }
                 vm_list,has_more = api.nova.server_list(request,search_opts,all_tenants=True )
                 
                 if service_state =='':
                       result ={"status": "failed", "msg": "Cannot get service state"}
                       client.change_host(node_name, "Unlocked")
                 elif service_state == "down":
                       result ={"status": "failed", "msg": "Node is offline"}
                       client.change_host(node_name, "Unlocked")                       
                 elif len(vm_list)== 0:
                       if service_status =='enabled':
                          api.nova.service_disable(request,node_domain_name,binary= 'nova-compute')
                       result ={"status": "success", "msg": "Successfully locked"} 
                       client.change_host(node_name, "Locked")    
                 elif len(vm_list)> 0:
                       ret_val = api.nova.migrate_host(request,node_domain_name,live_migrate=True)                      
                       if ret_val['state'] == 'success':  
                             polling_times=5
                             vm_in_migrating = False
                             while polling_times > 0:
                                vm_list,has_more = api.nova.server_list(request,search_opts,all_tenants=True )
                                LOG.info("vm in:%s,num of vm :%d" %(node_domain_name,len(vm_list)))
                                polling_times = polling_times -1                                
                                vm_in_migrating = False
                                vm_list_length = len(vm_list) 
                                if vm_list_length > 0:
                                   for vm in vm_list:
                                      if vm.status=='MIGRATING':                                         
                                         vm_in_migrating = True
                                         break
                                   if vm_in_migrating :
                                      sleep_interval = 3 * vm_list_length                                     
                                      LOG.info("node:%s, wait_migrate :%d" %(node_domain_name,sleep_interval))
                                      time.sleep(sleep_interval) ##3 second
                                   else:
                                     break
                                else:
                                   break
                             vm_list,has_more = api.nova.server_list(request,search_opts,all_tenants=True )
                             if len(vm_list)== 0:                                                        
                                api.nova.service_disable(request,node_domain_name,binary= 'nova-compute')
                                result ={"status": "success", "msg": "Node %s locked" % node_name} 
                                LOG.info("Successfully lock Node %s locked" % node_name)
                                client.change_host(node_name, "Locked")
                             elif vm_in_migrating :
                                result ={"status": "failed", "msg": "VM in %s is migrating; please ensure compute node is same in core_per_socket and try later"%node_name}
                                LOG.info("Fail to lock Node %s locked,VM %d" % (node_name,len(vm_list)))
                                client.change_host(node_name, "Unlocked")                                   
                             else:
                                result ={"status": "failed", "msg": "Cannot lock %s; VM on it"%node_name}
                                LOG.info("Fail to lock Node %s locked,VM %d" % (node_name,len(vm_list)))
                                client.change_host(node_name, "Unlocked")                             
                             
                       else:
                              result ={"status": "failed", "msg": ret_val.get('info',"")}
                              client.change_host(node_name, "Unlocked")
                              LOG.info("migrate fail:%s" %(ret_val.get('info')))
                 else :
                       result ={"status": "error", "msg": "Unknown node state"}
                       ###lighttpd  POST http://127:0.0.1:9080/openstack/?operation=change_state
                       
      
        else:
            LOG.error('host lock in nova:%s'%node_name)
            result ={"status": "failed", "msg": "Invalid node operation"}

        return  result



##added by laixf 2017/06/29 for Lock node optimization
@urls.register
class change_Host_state(generic.View):
     url_regex =  r'nova/host/(?P<node_name>[^/]+)/status$'
     @rest_utils.ajax(data_required=True)
     def post(self, request, node_name):
        #node_domain_name='%s%s'%(str(node_name),".domain.tld")
        node_domain_name=node_name
        state_to_change = request.DATA.get('status', 'none')
        client = uus.client()
        client.change_host(node_name, state_to_change)
        result = {"status": "success"}
        return  result
         
@urls.register
class Servers_in_Node(generic.View):
    url_regex =  r'nova/servers/(?P<node_name>[^/]+)/node$'

    @rest_utils.ajax()
    def get(self, request,node_name):
        node_domain_name='%s%s'%(str(node_name),".domain.tld")
        search_opts={'host':node_domain_name, 'all_tenants':True }
        vm_list,has_more = api.nova.server_list(request,search_opts,all_tenants=True )
        LOG.info("vm in:%s,num:%d" %(node_domain_name,len(vm_list)))
        
        items = []
        for item in vm_list:
                item_dict = item.to_dict()
                if hasattr(item, 'image_display_name'):
                    item_dict.update(
                        {'image_display_name': item.image_display_name})
                if hasattr(item, 'ip_groups'):
                    item_dict.update({'ip_groups': item.ip_groups})
                if hasattr(item, 'has_snapshot'):
                    item_dict.update({'has_snapshot': item.has_snapshot})
                items.append(item_dict)
        return dict(has_more=has_more, items=items)


# generate the random str
def random_str(randomlength=8):
    a = list(string.ascii_letters)
    random.shuffle(a)
    return ''.join(a[:randomlength])
