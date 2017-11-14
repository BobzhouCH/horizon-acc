import json
import urllib

from django.test import TestCase
from unittest import skip


class UnifiedServiceRestTestCase(TestCase):
    def setUp(self):
        self.client.post('/auth/login/', {'username': 'admin@example.org',
                                          'password': 'stackb0x'})

    def test_hosts_get_all(self):
        response = self.client.get('/api/uus/hosts/',
                                   HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.content)
        self.assertEqual(len(json_data['items']), 5)
        self.assertEqual(json_data['stat_info']['controller'], 2)
        self.assertEqual(json_data['stat_info']['compute'], 3)
        self.assertEqual(json_data['stat_info']['storage'], 1)
        self.assertListEqual(json_data['items'][0]['roles'], ['controller'])

    def test_host_get(self):
        response = self.client.get('/api/uus/host/732ebc33a87d41ccbae526ca4b8cabfc',
                                   HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.content)
        self.assertEqual(json_data['uuid'], "732ebc33a87d41ccbae526ca4b8cabfc")
        self.assertEqual(json_data['hostname'], "node-3")
        self.assertEqual(json_data['roles'], 1024)
        self.assertListEqual(json_data['role_names'], ['cinder'])
        self.assertEqual(json_data['status'], "Critical")

    def test_host_poweron(self):
        response = self.client.post('/api/uus/host/732ebc33a87d41ccbae526ca4b8cabfc',
                                    data=json.dumps({'operation': 'poweron'}),
                                    content_type='application/json',
                                    HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 204)

    def test_host_poweroff(self):
        response = self.client.post('/api/uus/host/732ebc33a87d41ccbae526ca4b8cabfc',
                                    data=json.dumps({'operation': 'poweroff'}),
                                    content_type='application/json',
                                    HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 204)

    @skip("not supported with mock data")
    def test_host_reboot(self):
        response = self.client.post('/api/uus/host/732ebc33a87d41ccbae526ca4b8cabfc',
                                    data=json.dumps({'operation': 'reboot'}),
                                    content_type='application/json',
                                    HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 204)

    def test_host_invalid_power_state(self):
        response = self.client.post('/api/uus/host/732ebc33a87d41ccbae526ca4b8cabfc',
                                    data=json.dumps({'operation': 'noop'}),
                                    content_type='application/json',
                                    HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 400)

    def test_host_delete(self):
        response = self.client.delete('/api/uus/host/732ebc33a87d41ccbae526ca4b8cabfc',
                                      HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 204)

    def test_host_auth(self):
        response = self.client.post('/api/uus/host/732ebc33a87d41ccbae526ca4b8cabfc/auth',
                                    data=json.dumps({'userid': 'USERID',
                                                     'password': 'PASSW0RD'}),
                                    content_type='application/json',
                                    HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 204)

    def test_host_auth_with_invalid_credential(self):
        response = self.client.post('/api/uus/host/732ebc33a87d41ccbae526ca4b8cabfc/auth',
                                    data=json.dumps({'userid': 'USERNAME',
                                                     'password': 'WRONGPASS'}),
                                    content_type='application/json',
                                    HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 500)

    def test_host_auth_without_password(self):
        response = self.client.post('/api/uus/host/732ebc33a87d41ccbae526ca4b8cabfc/auth',
                                    data=json.dumps({'userid': 'USERNAME'}),
                                    content_type='application/json',
                                    HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 400)

    def test_host_auth_without_username(self):
        response = self.client.post('/api/uus/host/732ebc33a87d41ccbae526ca4b8cabfc/auth',
                                    data=json.dumps({'password': 'WRONGPASS'}),
                                    content_type='application/json',
                                    HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 400)

    def test_host_eventlogs_get(self):
        response = self.client.get('/api/uus/host/66E16C8DA6A80E7C9D10996B54CFFF30/eventlogs',
                                   HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        print "Response: ", response.content
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.content)
        self.assertEqual(json_data['uuid'], "66E16C8DA6A80E7C9D10996B54CFFF30")
        self.assertEqual(json_data['status'], "Critical")
        self.assertEqual(json_data['alerts']['Critical'], 3)
        self.assertEqual(json_data['alerts']['Warning'], 1)
        self.assertEqual(json_data['alerts']['Info'], 0)
        self.assertEqual(len(json_data['events']), 4)

    def test_switches_get_all(self):
        response = self.client.get('/api/uus/switches/',
                                   HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.content)
        items = json_data['items']
        self.assertEqual(len(items), 2)
        self.assertEqual(items[0]['uuid'], "20202020202020202020202020202020")
        self.assertEqual(items[0]['hostname'], "01-GN8042")
        self.assertEqual(items[0]['serialNum'], "my21300291")
        self.assertEqual(items[0]['pmswitch_id'], "048263890dfadf2028b0acf31e59310d")
        self.assertEqual(items[0]['ssh_port'], "830")
        self.assertEqual(items[0]['os_type'], "cnos")
        self.assertEqual(items[1]['uuid'], "20202020202020202020202020111110")
        self.assertEqual(items[1]['hostname'], "02-GN8042")
        self.assertEqual(items[1]['serialNum'], "my21300292")
        self.assertEqual(items[1]['pmswitch_id'], "048263890dfadf2028b0acf31e59310d")
        self.assertEqual(items[1]['ssh_port'], "830")
        self.assertEqual(items[1]['os_type'], "cnos")

    def test_switch_create(self):
        response = self.client.post('/api/uus/switches/',
                                    data=json.dumps({
                                        "switch_ip": "10.240.253.201",
                                        "username": "admin",
                                        "ssh_port": "830",
                                        "os_type": "cnos",
                                        "password": "admin",
                                        "protocol": "rest",
                                    }),
                                    content_type='application/json',
                                    HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 204)

    def test_switch_create_with_bad_format(self):
        response = self.client.post('/api/uus/switches/',
                                    data=json.dumps({
                                        "username": "admin",
                                        "ssh_port": "830",
                                        "os_type": "cnos",
                                        "password": "admin",
                                        "protocol": "rest",
                                    }),
                                    content_type='application/json',
                                    HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 400)

    def test_switch_get(self):
        response = self.client.get('/api/uus/switch/2f07137f08f944a38acf3062bb333e07+048263890dfadf2028b0acf31e59310d',
                                   HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.content)
        self.assertEqual(json_data['uuid'], "2f07137f08f944a38acf3062bb333e07")
        self.assertEqual(json_data['hostname'], "G8272")
        self.assertEqual(json_data['switch_ip'], "10.240.194.91")
        self.assertEqual(json_data['username'], "admin")
        self.assertEqual(json_data['serialNum'], "Y052MV49Y010")
        self.assertEqual(json_data['ssh_port'], "830")
        self.assertEqual(json_data['os_type'], "cnos")

    def test_switch_delete(self):
        response = self.client.delete(
            '/api/uus/switch/2f07137f08f944a38acf3062bb333e07+048263890dfadf2028b0acf31e59310d',
            HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 204)

    def test_switch_update(self):
        response = self.client.put('/api/uus/switch/2f07137f08f944a38acf3062bb333e07+048263890dfadf2028b0acf31e59310d',
                                   data=json.dumps({
                                       "username": "admin",
                                       "password": "NEW_PASSWORD",
                                   }),
                                   content_type='application/json',
                                   HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 204)

    def test_switch_portmapping_get_all(self):
        response = self.client.get(
            '/api/uus/switch/2f07137f08f944a38acf3062bb333e07+048263890dfadf2028b0acf31e59310d/portmapping',
            HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 200)
        json_data = json.loads(response.content)
        port_mapping = json_data['port_mapping']
        self.assertEqual(len(port_mapping), 3)
        self.assertEqual(port_mapping['node-1'], "portchannel:1")
        self.assertEqual(port_mapping['node-2'], "portchannel:2")
        self.assertEqual(port_mapping['node-3'], "portchannel:3")

    def test_switch_portmapping_add(self):
        response = self.client.post(
            '/api/uus/switch/2f07137f08f944a38acf3062bb333e07+048263890dfadf2028b0acf31e59310d/portmapping',
            data=json.dumps({
                "port_mapping": {
                    "node-5": "1/20",
                    "node-6": "1/23",
                }
            }),
            content_type='application/json',
            HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 204)

    def test_switch_portmapping_delete(self):
        node_list = ['node-1', 'node-2', 'node-3']

        response = self.client.delete(
            '/api/uus/switch/2f07137f08f944a38acf3062bb333e07+048263890dfadf2028b0acf31e59310d/portmapping'
            '?nodes=' + '+'.join(map(urllib.pathname2url, node_list)),
            HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 204)

    def test_switch_portmapping_delete_with_bad_format(self):
        response = self.client.delete(
            '/api/uus/switch/2f07137f08f944a38acf3062bb333e07+048263890dfadf2028b0acf31e59310d/portmapping',
            HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 400)

    def test_switch_portmapping_update(self):
        response = self.client.patch(
            '/api/uus/switch/2f07137f08f944a38acf3062bb333e07+048263890dfadf2028b0acf31e59310d/portmapping',
            data=json.dumps({
                "port_mapping": {
                    "node-5": "portchannel:48",
                    "node-6": "portchannel:47",
                }
            }),
            content_type='application/json',
            HTTP_X_REQUESTED_WITH='XMLHttpRequest')
        self.assertEqual(response.status_code, 204)
