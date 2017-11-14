import logging
import os
import requests
import json
import commands
import uuid as uuid_util
import datetime as dt
from requests.exceptions import RequestException
from django.conf import settings
from django.core.cache import cache
from django.utils.translation import ugettext_lazy as _

from lenovo_dashboard.api.utils import APIEntry, filter_dict
import socket

LOG = logging.getLogger(__name__)

TESTDATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.realpath(__file__))), 'testdata', 'uus')

POWER_HISTORY_DATA = os.path.join(TESTDATA_DIR, 'uus-data_show_power_history.json')
LIST_POWER_CAPPING_DATA = os.path.join(TESTDATA_DIR, 'uus-data_show_power_capping.json')
UPDATE_POWER_CAPPING_DATA = os.path.join(TESTDATA_DIR, 'uus-data_update_power_capping.json')
LIST_HOSTS_DATA = os.path.join(TESTDATA_DIR, 'uus-data_list_hosts.json')
LIST_COMPUTEHA_DATA = os.path.join(TESTDATA_DIR, 'uus-data_list_compute_ha.json')
UPDATE_COMPUTEHA_DATA = os.path.join(TESTDATA_DIR, 'uus-data_update_compute_ha.json')
SHOW_HOST_DATA = os.path.join(TESTDATA_DIR, 'uus-data_show_host.json')
SHOW_IMM_LOGS_DATA = os.path.join(TESTDATA_DIR, 'uus-data_show_imm_logs.json')
LIST_SWITCHES_DATA = os.path.join(TESTDATA_DIR, 'uus-data_list_switches.json')
SHOW_SWITCH_DATA = os.path.join(TESTDATA_DIR, 'uus-data_show_switch.json')
DISCOVER_SWITCH_DATA = os.path.join(TESTDATA_DIR, 'uus-data_discover_switch.json')
UPDATE_SWITCH_DATA = os.path.join(TESTDATA_DIR, 'uus-data_update_switch.json')
DELETE_SWITCH_DATA = os.path.join(TESTDATA_DIR, 'uus-data_delete_switch.json')
LIST_PORTMAPPING_SWITCH_DATA = os.path.join(TESTDATA_DIR, 'uus-data_list_portmapping_switch.json')
UPDATE_PORTMAPPING_SWITCH_DATA = os.path.join(TESTDATA_DIR, 'uus-data_update_pmswitch.json')
LIST_PORTMAPPING_NODE_DATA = os.path.join(TESTDATA_DIR, 'uus-data_list_portmapping_node.json')
UPDATE_PORTMAPPING_NODE_DATA = os.path.join(TESTDATA_DIR, 'uus-data_update_portmapping_node.json')
LIST_PORTMAPPING_ONE_SWITCH_DATA = os.path.join(TESTDATA_DIR, 'uus-data_list_portmapping_one_switch.json')
LIST_PORTMAPPING_ONE_NODE_DATA = os.path.join(TESTDATA_DIR, 'uus-data_list_portmapping_one_node.json')
HOST_LIST_FIELDS = (
    'uuid',
    'hostname',
    'roles',
    'status',
    'alerts',
    'power',
    'type',
    'productname',
    'mt',
    'hostip',
    'bmcip',
    'pn',
    'sn',
    'supported_categories',
    'desired_categories',
    'authed',
    'http_enabled',
    'https_enabled',
)

HOST_DETAIL_FIELDS = (
    'PhysicalMemory',
    'NumericSensor',
    'IMM',
    'RecordLog',
    'Fan',
    'Nic',
    'EthernetPort',
    'RAID',
    'Processor',
    'SoftwareIdentity',
)

SWITCH_LIST_FIELDS = (
    'uuid',
    'hostname',
    'ip',
    'mac',
    'serialNum',
    'osVer',
    'cpu',
    'memory',
    'status',
    'hw_type',
)

PORTMAPPING_SWITCH_LIST_FIELDS = (
    'uuid',
    'switch_ip',
    'ssh_port',
    'username',
    #    'password',
)

PORTMAPPING_NODE_LIST_FIELDS = (
    'uuid',
    'node_id',
    'interface',
)

EVENT_LOG_FIELDS = (
    'id',
    'source',
    'msg',
)
UPGRADE_STATUS_FILEDS = (
    'timestamp',
    'status',
    'result',
)

DEFAULT_USERNAME = 'USERID'
DEFAULT_PASSWORD = 'PASSW0RD'


class Client(object):
    DEFAULT_BASE_URL = 'http://127.0.0.1:9080'

    def __init__(self, base_url=DEFAULT_BASE_URL, mockup=False):
        self.base_url = base_url
        self.mockup = mockup

    def showall_upgradestatus(self):
        LOG.info('GET /v1/platform/upgrade/list_upgrade')

        if self.mockup:
            return_data = [{"id": 0, "timestamp": "20150605", "status": "running", "result": "ok"},
                           {"id": 1, "timestamp": "20150605", "status": "running", "result": "ok"}]
            return return_data
        else:
            r = requests.get(self.base_url + '/v1/platform/upgrade/list_upgrade', verify=False)
            response = r.json()

        try:
            return_code = response[u'return_code']
            return_data = response[u'return_data']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

#        if len(return_data) > 0:
#            i = 0
#            for data_item in return_data:
#                return_data[i]['id'] = i
#                i = i + 1
        # cache.set(cache_key, (entries, stat), 30)
        return return_data

    def get_upgradestatus(self,patch_id):
        LOG.info('GET /v1/platform/upgrade/get_upgrade')

        if self.mockup:
            return_data = {"return_data": "1.2.3.4", "return_code":"0"}

            return return_data
        else:
            payload = {'patch_id': patch_id}
            r = requests.post(self.base_url + '/v1/platform/upgrade/get_upgrade', json=payload, verify=False)
            response = r.json()

        try:
            return_code = response[u'return_code']
            return_data = response[u'return_data']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return return_data

    def startupgrade(self, pathtostart, data):
        LOG.info('POST /v1/platform/upgrade/start_upgrade with pathtostart=%s' % pathtostart)
        hostname = socket.gethostname()

        payload = {'path': pathtostart,'host':hostname, 'data': data}

        r = requests.post(self.base_url + '/v1/platform/upgrade/start_upgrade', json=payload, verify=False)
        response = r.json()
        try:
            return_code = response[u'return_code']
            return_data = response[u'return_data']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        return return_code

    def list_hosts(self):
        # cache_key = 'uus_list_hosts'
        # cached_result = cache.get(cache_key)
        #
        # if cached_result is not None:
        #     return cached_result

        LOG.info('GET /v1/server/list_hosts')

        if self.mockup:
            with open(LIST_HOSTS_DATA) as fp:
                response = json.load(fp)
        else:
            r = requests.get(self.base_url + '/v1/server/list_hosts', verify=False)
            response = r.json()

        try:
            return_code = response[u'return_code']
            return_data = response[u'return_data']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        entries = list()
        stat_info = {
            'controller': 0,
            'compute': 0,
            'storage': 0,
            'others': 0,
            'alerts': {
                'Healthy': 0,
                'critical': 0,
                'warning': 0,
            }
        }
        for datum in return_data:
            datum = datum.get('IMM')
            datum['role_names'] = self.__parse_role_names(datum)
            entries.append(datum)

            roles = datum['roles']
            roles_added = False
            if roles & 0x100 != 0:
                stat_info['controller'] += 1
                roles_added = True
            if roles & 0x200 != 0:
                stat_info['compute'] += 1
                roles_added = True
            if roles & (0x400 | 0x800 | 0x2000) != 0:
                stat_info['storage'] += 1
                roles_added = True
            if not roles_added:
                stat_info['others'] += 1

            if 'alerts' in datum:
                # stat_info['alerts']['info'] += datum['alerts']['Info']
                stat_info['alerts']['Healthy'] += datum['alerts']['Healthy']
                stat_info['alerts']['critical'] += datum['alerts']['Critical']
                stat_info['alerts']['warning'] += datum['alerts']['Warning']

        # cache.set(cache_key, (entries, stat), 30)
        return entries, stat_info

    def lookup_host_by_uuid(self, uuid):
        cache_key = 'uus_hosts_uuid_index'

        uuid_index = cache.get(cache_key)

        if uuid_index is None:
            LOG.info('Generating Host UUID index ...')
            data, stat = self.list_hosts()
            uuid_index = dict()
            for host in data:
                host_uuid = host.uuid
                uuid_index[host_uuid] = host
            cache.set(cache_key, uuid_index, 30)  # 30 seconds timeout

        return uuid_index.get(uuid)

    def show_host(self, uuid, details=True):
        LOG.info('POST /v1/server/show_hosts with uuid=%s' % uuid)

        if self.mockup:
            with open(SHOW_HOST_DATA) as fp:
                response = json.load(fp)
        else:
            payload = {"hosts": [uuid]}
            r = requests.post(self.base_url + '/v1/server/show_hosts', json=payload, verify=False)
            response = r.json()

        try:
            return_code = response[u'return_code']
            return_data = response[u'return_data']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        if len(return_data) > 0:
            full_data = filter_dict(return_data[0], fields=HOST_DETAIL_FIELDS)
            primary_imm = full_data['IMM']
            if details:
                full_data.update(primary_imm)
                data = full_data
            else:
                data = primary_imm

            data['role_names'] = self.__parse_role_names(data)
            return data
        else:
            raise InvalidFormatError('empty endpoint data')

    def show_imm_log(self, uuid):
        LOG.info('POST /v1/server/show_imm_logs with uuid=%s' % uuid)

        if self.mockup:
            with open(SHOW_IMM_LOGS_DATA) as fp:
                response = json.load(fp)
        else:
            payload = {'hosts': [uuid]}
            r = requests.post(self.base_url + '/v1/server/show_imm_logs', json=payload,
                              verify=False)
            response = r.json()

        try:
            return_code = response[u'return_code']
            return_data = response[u'return_data']
            status_data = return_data[0][u'status']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)
        events = list()
        if len(status_data) > 0:
            info = status_data

            try:

                events.extend(self.__parse_imm_events(info['events']['Critical'], 'Critical'))
                events.extend(self.__parse_imm_events(info['events']['Warning'], 'Warning'))
                events.extend(self.__parse_imm_events(info['events']['Info'], 'Info'))

                meta = {
                    'uuid': info['uuid'],
                    'status': info['status'],
                    'alerts': {
                        'Critical': len(info['events']['Critical']),
                        'Warning': len(info['events']['Warning']),
                        'Info': len(info['events']['Info']),
                    },
                    'events': events
                }

            except KeyError as e:
                raise InvalidFormatError(str(e))

            return meta
        else:
            raise InvalidFormatError('empty endpoint data')

    def __parse_imm_events(self, raw_data, severity):
        entries = list()

        for item in raw_data:
            timestamp = item['time']
            item['datetime'] = dt.datetime.utcfromtimestamp(timestamp).isoformat()
            item['severity'] = severity
            entries.append(item)

        return entries

    def __parse_role_names(self, host):
        role_names = []

        mask = host.get('roles', 0)

        if mask & 0x0100 != 0:
            role_names.append('controller')  # Controller
        if mask & 0x0200 != 0:
            role_names.append('compute')  # Compute Node
        if mask & 0x0400 != 0:
            role_names.append('cinder')  # Cinder
        if mask & 0x0800 != 0:
            role_names.append('ceph-osd')  # Ceph OSD
        if mask & 0x1000 != 0:
            role_names.append('mongo')  # Mongo
        if mask & 0x2000 != 0:
            role_names.append('storage')  # Storage
        if mask & 0x4000 != 0:
            role_names.append('swift-proxy')  # Storage
        if mask & 0x8000 != 0:
            role_names.append('neutron-l3')  # Neutron L3
        if mask & 0x10000 != 0:
            role_names.append('elk')  # ELK
        if mask & 0x20000 != 0:
            role_names.append('zabbix-server')  # Neutron L3
        if mask & 0x40000000 != 0:
            role_names.append('undefined')  # Undefined

        return role_names

    def delete_imm_log(self, uuid, msgid):
        LOG.info('POST /v1/server/delete_imm_logs with uuid={0}, msgid={1}'.format(uuid, msgid))

        if self.mockup:
            return True
        else:
            payload = {'hosts': [
                {'uuid': uuid,
                 'msgids': [int(msgid)]}
            ]}
            r = requests.post(self.base_url + '/v1/server/delete_imm_logs', json=payload,
                              verify=False)
            response = r.json()

        try:
            return_code = response[u'return_code']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return True

    def auth_imm(self, uuid, userid, password):
        LOG.info('POST /v1/server/auth_imm with uuid="%s"' % uuid)

        if self.mockup:
            if userid == DEFAULT_USERNAME and \
                            password == DEFAULT_PASSWORD:
                return True
            else:
                raise OperationError(99, _("Authentication"))

        payload = {'hosts': [{"uuids": [uuid], "userid": userid, "password": password}]}
        r = requests.post(self.base_url + '/v1/server/auth_imm', json=payload, verify=False)
        response = r.json()

        try:
            return_code = response[u'return_code']
            return_data = response[u'return_data']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code, _("Authentication"))

        return return_code == 0

    def delete_host(self, uuid):
        LOG.info('POST /endpoints/?operation=delete with uuid="%s"' % uuid)

        if self.mockup:
            return True

        payload = {'uuids': [uuid]}
        r = requests.post(self.base_url + '/endpoints/?operation=delete', json=payload,
                          verify=False)
        response = r.json()

        try:
            return_code = response[u'return_code']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if (return_code != 0):
            raise OperationError(return_code)

        return True

    def reboot(self, uuid):
        return self.change_power_state(uuid, 2)

    def poweron(self, uuid):
        return self.change_power_state(uuid, 1)

    def poweroff(self, uuid):
        return self.change_power_state(uuid, 0)

    ### added by laixf 2017/3/20 for Lock Unlock feature###
    def change_host(self,host_name,state):
        LOG.info('POST /v1/server/change_host="%s", state=%s' % (host_name, state))
        
        payload = {'hostname': host_name,
                        'state': state}
                        
        r = requests.post(self.base_url + '/v1/server/change_host', json=payload,
                          verify=False)
        response = r.json() 
      
        try:
            return_code = response[u'return_code']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return True
        
    def change_power_state(self, uuid, state):
        LOG.info('POST /v1/server/change_power_state with uuid="%s", state=%d' % (uuid, state))

        if self.mockup:
            if state == 2:
                raise OperationError(99)
            return True

        payload = {'host': uuid,'state': state}
        r = requests.post(self.base_url + '/v1/server/change_power_state', json=payload,
                          verify=False)
        response = r.json()

        try:
            return_code = response[u'return_code']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return True

    def show_host_power_capping(self, uuid):
        LOG.info('POST /v1/server/check_power_capping with uuid=%s' % uuid)

        if self.mockup:
            with open(LIST_POWER_CAPPING_DATA) as fp:
                response = json.load(fp)
        else:
            payload = {'uuid': uuid}
            r = requests.post(self.base_url + '/v1/server/check_power_capping', json=payload, verify=False)
            response = r.json()

        try:
            return_code = response[u'return_code']
            return_data = response[u'return_data']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return return_data

    def set_host_power_capping(self, uuid, newCap):
        LOG.info('POST /v1/server/set_power_capping with uuid=%s,newCap=%s' % (uuid,newCap))

        if self.mockup:
            with open(UPDATE_POWER_CAPPING_DATA) as fp:
                response = json.load(fp)
        else:
            payload = {'uuid': uuid, "newCap": newCap}
            r = requests.post(self.base_url + '/v1/server/set_power_capping', json=payload, verify=False)
            response = r.json()

        try:
            return_code = response[u'return_code']
            return_data = response[u'return_data']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return return_data

    def show_host_power_history(self, uuid, interval, duration):
        LOG.info('POST /v1/server/get_power_history with uuid=%s' % uuid)

        if self.mockup:
            with open(POWER_HISTORY_DATA) as fp:
                response = json.load(fp)
        else:
            payload = {'uuid': uuid, "interval":interval, "duration":duration}
            r = requests.post(self.base_url + '/v1/server/get_power_history', json=payload, verify=False)
            response = r.json()

        try:
            return_code = response[u'return_code']
            return_data = response[u'return_data']
            history_data = return_data[u'Data']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        if len(history_data) > 0:
            return history_data
        else:
            raise InvalidFormatError('empty power history data')

    def set_pfa_policy(self, uuid, value):
        LOG.info('POST /ras/categories/?operation=set_desired with uuid="%s", value=%08x' % (uuid, value))

        if self.mockup:
            return True

        payload = {'uuid': [uuid],
                   'value': value}
        r = requests.post(self.base_url + '/ras/categories/?operation=set_desired', josn=payload,
                          verify=False)
        response = r.json()

        try:
            return_code = response[u'return_code']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return True

    def list_switches(self):
        LOG.info('GET /v1/switch/showswitch_all')

        if self.mockup:
            with open(LIST_SWITCHES_DATA) as fp:
                response = json.load(fp)
        else:
            r = requests.get(self.base_url + '/v1/switch/showswitch_all', verify=False)
            response = r.json()

        try:
            return_code = response[u'return_code']
            endpoints = response[u'return_data']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        for entry in endpoints:
            switch_uuid = entry['uuid']
            entry['uuid'] = uuid_util.UUID(switch_uuid).hex
            if not entry.has_key('switch_ip'):
                entry['switch_ip'] = entry['ip']
        LOG.info("list_switches %s" % endpoints)
        return endpoints

    def show_switch(self, uuid):
        LOG.info('POST /v1/switch/showswitch with uuid=%s' % uuid)

        if self.mockup:
            with open(DISCOVER_SWITCH_DATA) as fp:
                response = json.load(fp)
        else:
            payload = {"endpoints": [{"uuid": str(uuid_util.UUID(uuid))}]}
            LOG.info('lenovo_uus:show_switch:payload = %s' % payload )
            r = requests.post(self.base_url + '/v1/switch/showswitch', json=payload, verify=False)
            response = r.json()
        LOG.info('lenovo_uus:show_switch:response = %s' %response)

        try:
            return_code = response[u'return_code']
            endpoints = response[u'return_data']
        except KeyError as e:
            raise InvalidFormatError(str(e))


        if return_code != 0:
            raise OperationError(return_code)
        if len(endpoints) > 0 and endpoints[0] != {}:
            data = endpoints[0]
            switch_uuid = data['uuid']
            data['uuid'] = uuid_util.UUID(switch_uuid).hex
            if not data.has_key('switch_ip'):
                data['switch_ip'] = data['ip']

            return data
        else:
            return {}

    def switch_discovery(self, switch_ip, username, password,os_type):
        LOG.info('POST /v1/switch/add')

        if self.mockup:
            return True
        else:
            payload = {'endpoints': [{'ip': str(switch_ip),
                                      'userid': username,
                                      'password': password,
                                      'os_type': os_type}]}
            r = requests.post(self.base_url + '/v1/switch/add', json=payload, verify=False)
            response = r.json()

        try:
            return_code = response[u'return_code']
            return_data = response[u'return_data']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code == 10008:
            raise Exception(_("switch %s is not a CNOS switch or does not enabled rest supported") %switch_ip)
        elif return_code != 0:
            raise Exception(_("can not connect to the switch %s") %switch_ip)
        else:
            return return_data[0]

    def delete_switch(self, uuid):
        LOG.info('POST /v1/switch/delete')

        if self.mockup:
            return True
        else:
            payload = {'endpoints': [{'uuid':str(uuid_util.UUID(uuid))}]}
            r = requests.post(self.base_url + '/v1/switch/delete', json=payload, verify=False)
            response = r.json()
        LOG.info('delete_switch %s' % response )
        try:
            return_code = response[u'return_code']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return True

    def list_portmapping_switches(self):
        LOG.info('GET /v1/portmapping/showPortMappingSwitches')

        if self.mockup:
            with open(LIST_PORTMAPPING_SWITCH_DATA) as fp:
                response = json.load(fp)
        else:
            r = requests.get(self.base_url + '/v1/portmapping/showPortMappingSwitches', verify=False)
            response = r.json()
            if response is None or response =={}:
                return response
        try:
            return_code = response[u'return_code']
            endpoints = response[u'return_data']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        for entry in endpoints:
            switch_uuid = entry['uuid']
            entry['uuid'] = uuid_util.UUID(switch_uuid).hex

        return endpoints

    def show_portmapping_switch(self, uuid):
        LOG.info('GET /v1/portmapping/showPortMappingSwitch with uuid %s' % uuid)

        if self.mockup:
            with open(LIST_PORTMAPPING_ONE_SWITCH_DATA) as fp:
                response = json.load(fp)
        else:
            payload = {'uuid': str(uuid_util.UUID(uuid))}
            r = requests.post(self.base_url + '/v1/portmapping/showPortMappingSwitch', json=payload,
                              verify=False)
            response = r.json()
            LOG.info("show_portmapping_switch resopnse = %s" %(response))
        try:
            return_code = response[u'return_code']
            endpoints = response[u'return_data']

        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        if len(endpoints) > 0:
            data = endpoints[0]
            switch_uuid = data['uuid']
            data['uuid'] = uuid_util.UUID(switch_uuid).hex
            return data
        else:
            return {}

    def add_portmapping_switch(self, switch_ip, ssh_port, username, password,
                               os_type='cnos', protocol='rest',rest_tcp_port='443'):
        LOG.info('POST /v1/portmapping/addPortMappingSwitch')

        if self.mockup:
            return True
        else:
            payload = {'endpoints': [{
                'switch_ip': switch_ip,
                'ssh_port': ssh_port,
                'username': username,
                'password': password,
                'os_type': os_type,
                'protocol': protocol,
                'rest_tcp_port': rest_tcp_port,
            }]}
            r = requests.post(self.base_url + '/v1/portmapping/addPortMappingSwitch', json=payload,
                              verify=False)
            response = r.json()

        try:
            return_code = response["return_code"]
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise Exception(_("switch %s can not create portmapping") %switch_ip)

        return True

    def update_switch_user(self, uuid, username, password):
        LOG.info('POST /v1/switch/update_user')

        if self.mockup:
            return True
        else:
            payload = {"endpoints": {"uuid": str(uuid_util.UUID(uuid)),
                                     'username': username,
                                     'password': password}}
            r = requests.post(self.base_url + '/v1/switch/update_user',
                              json=payload, verify=False)
            response = r.json()
            LOG.info('lenovo_uus:update_switch_user:responese = %s' % response )

        try:
            return_code = response[u'return_code']

        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return True

    def delete_portmapping_switches(self, uuid):
        LOG.info('POST /v1/portmapping/deletePortMapping')

        if self.mockup:
            return True
        else:
            payload = {'uuids': [str(uuid_util.UUID(uuid))]}
            r = requests.post(self.base_url + '/v1/portmapping/deletePortMapping', json=payload,
                              verify=False)
            response = r.json()
            LOG.info('deletePortMappingSwitch_json:payload:%s:response:%s' % (payload, response))

        try:
            return_code = response[u'return_code']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return True

    def list_portmapping_nodes(self, uuid):
        LOG.info(' /v1/portmapping/showPortMappingNodes with switch_uuid=%s' % uuid)

        if self.mockup:
            with open(LIST_PORTMAPPING_NODE_DATA) as fp:
                response = json.load(fp)
        else:
            payload = {'uuid': str(uuid_util.UUID(uuid))}
            r = requests.post(self.base_url + '/v1/portmapping/showPortMappingNodes', json=payload,
                              verify=False)
            response = r.json()

        try:
            return_code = response[u'return_code']
            return_data = response[u'return_data']
            mapping_nodes = return_data['nodes']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return mapping_nodes

    def add_portmapping_nodes(self, uuid, mapping_info):
        # maybe do the same as add portmapping node
        # self.update_portmapping_node(uuid, node_id, interface)
        LOG.info('POST /v1/portmapping/addPortMappingNodes')

        if self.mockup:
            return True
        else:
            payload = {'uuid': str(uuid_util.UUID(uuid)),
                       'nodes': mapping_info.copy()}

            r = requests.post(self.base_url + '/v1/portmapping/addPortMappingNodes', json=payload,
                              verify=False)
            response = r.json()
            LOG.info('response = %s' % response )

        try:

            return_code = response[u'return_code']
            return_data = response[u'return_data']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise InvalidFormatError(return_data[0][u'msg'])

        return True


    def update_portmapping_nodes(self, uuid, mapping_info):
        LOG.info('POST /portmapping/?operation=updatePortMappingNodes mapping_info %s' %mapping_info)

        if self.mockup:
            with open(UPDATE_PORTMAPPING_NODE_DATA) as fp:
                response = json.load(fp)
        else:
            payload = {'uuid': str(uuid_util.UUID(uuid)),
                       'nodes':  mapping_info.copy() }
            LOG.info('request payload =  %s' %payload)
            r = requests.post(self.base_url + '/v1/portmapping/updatePortMappingNodes',
                              json=payload,
                              verify=False)
            response = r.json()
            LOG.info('POST /portmapping/?operation=updatePortMappingNodes response %s' %response)
        try:
            return_code = response[u'return_code']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return True

    def update_portmapping_switch(self, uuid, username, password):
        LOG.info('POST /v1/portmapping/updatePortMappingSwitch')

        if self.mockup:
            return True
        else:
            payload = {"uuid": str(uuid_util.UUID(uuid)),
                       "updateDict": {
                           'username': username,
                           'password': password, }
                       }
            r = requests.post(self.base_url + '/v1/portmapping/updatePortMappingSwitch',
                              json=payload, verify=False)
            response = r.json()

        try:
            return_code = response[u'return_code']

        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return True
		
    def delete_portmapping_nodes(self, uuid, mapping_info):
        LOG.info('POST /v1/portmapping/deletePortMappingNodes,uuid %s' % uuid)

        if self.mockup:
            return True
        else:
            payload = {'uuid': str(uuid_util.UUID(uuid)),
                       'nodes': mapping_info.copy()}
            r = requests.post(self.base_url + '/v1/portmapping/deletePortMappingNodes',
                              json=payload,
                              verify=False)
            response = r.json()

        try:
            return_code = response[u'return_code']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return True

    def list_computeha(self):
        LOG.info('GET /v1/platform/computeha/show_policy')

        if self.mockup:
            with open(LIST_COMPUTEHA_DATA) as fp:
                response = json.load(fp)
        else:
            r = requests.get(self.base_url + '/v1/platform/computeha/show_policy', verify=False)
            response = r.json()

        try:
            return_code = response[u'return_code']
            return_data = response[u'return_data']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return return_data

    def set_computeha(self, halist):
        LOG.info('POST /v1/platform/computeha/update_policy')

        if self.mockup:
            with open(UPDATE_COMPUTEHA_DATA) as fp:
                response = json.load(fp)
        else:
            payload = halist.copy()
            r = requests.post(self.base_url + '/v1/platform/computeha/update_policy',
                              json=payload,
                              verify=False)

            response = r.json()

        try:
            return_code = response[u'return_code']
            return_data = response[u'return_data']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return return_data

    def refresh_security_setting(self, obsvtime, locktime, loctimes):
        LOG.info('POST /openstack/?operation=refresh_security_setting')

        payload = {'obsvtime': obsvtime,
                   'locktime': locktime,
                   'loctimes': loctimes}
        r = requests.post(self.base_url + '/openstack/?operation=refresh_security_setting',
                          data=json.dumps(payload), verify=False)
        response = r.json()
        LOG.info('lenovo_uus:refresh_security_setting:responese = %s' % response)

        try:
            return_code = response[u'return_code']
        except KeyError as e:
            raise InvalidFormatError(str(e))

        if return_code != 0:
            raise OperationError(return_code)

        return True


class OperationError(RequestException):
    def __init__(self, return_code, op_name='Operation'):
        self.return_code = return_code
        self.op_name = op_name

    def __str__(self):
        return str(_("%s failed with return code '%d'") % (self.op_name, self.return_code))


class InvalidFormatError(Exception):
    def __init__(self, msg):
        self.msg = msg

    def __str__(self):
        return self.msg


def client():
    base_url = getattr(settings, 'LENOVO_UUS_URL', None)
    mockup = getattr(settings, 'LENOVO_UUS_MOCKUP', False)

    if base_url:
        return Client(base_url, mockup=mockup)
    else:
        return Client(mockup=mockup)


def mock_client():
    return Client(mockup=True)

