# Copyright 2016 Lenovo, Inc.
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

import yaml
import re
import commands
import os

from django.conf import settings

from fabric.api import *
from fabric.context_managers import settings as fab_context
from fabric.context_managers import hide

from django.utils.translation import ugettext_lazy as _
from django.views import generic

import urls
from easystack_dashboard.api.rest import utils as rest_utils

from lenovo_dashboard.api import lenovo_uus as uus
import logging

from django.core.files.uploadedfile import InMemoryUploadedFile
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.files.uploadedfile import TemporaryUploadedFile
import time
import commands
from Crypto.PublicKey import RSA
import base64,os,sys
from Crypto.Hash import SHA
from Crypto.Cipher import PKCS1_v1_5 as Cipher
from Crypto.Signature import PKCS1_v1_5 as Signature
from horizon import messages
from horizon import exceptions

from fabric.api import *
from fabric.context_managers import settings as fab_context
from fabric.context_managers import hide
import json


LOG = logging.getLogger(__name__)

@urls.register
class Hosts(generic.View):
    """API for cinder volumes.
    """
    url_regex = r'uus/hosts/$'

    @rest_utils.ajax()
    def get(self, request):
        client = uus.client()
        result, stat_info = client.list_hosts()
        return {
            'items': result,
            'stat_info': stat_info,
        }


@urls.register
class Host(generic.View):
    url_regex = r'uus/host/(?P<host_id>[^/]+)$'

    @rest_utils.ajax()
    def get(self, request, host_id):
        client = uus.client()
        result = client.show_host(host_id)
        return result

    @rest_utils.ajax(data_required=True)
    def post(self, request, host_id):
        operation = request.DATA.get('operation', 'none')
        opcode_dict = {
            'poweroff': 0,
            'poweron': 1,
            'reboot': 2,
        }

        opcode = opcode_dict.get(operation, -1)
        if opcode < 0:
            result ={"status": "failed", "msg": "Invalid host operation "}
            return result
        try:
            client = uus.client()
            if client.change_power_state(host_id, opcode):
                result ={"status": "success", "msg": "success"}
            else:
                result ={"status": "failed", "msg": "Invalid host operation "}
            return result
        except Exception as e:
            result = {"status": "failed", "msg": str(e)}
            return result

    @rest_utils.ajax()
    def delete(self, request, host_id):
        try:
            client = uus.client()
            if client.delete_host(host_id):
                result ={"status": "success", "msg": "success"}
            else:
                result ={"status": "failed", "msg": "Delete failed "}
            return result
        except Exception as e:
            result = {"status": "failed", "msg": str(e)}
            return result


@urls.register
class HostAuth(generic.View):
    url_regex = r'uus/host/(?P<host_id>[^/]+)/auth'

    @rest_utils.ajax(data_required=True)
    def post(self, request, host_id):
        userid = request.DATA.get('userid')
        passowrd = request.DATA.get('password')
        if userid is None or passowrd is None:
            result ={"status": "failed", "msg": "NULL userid or password"}
            return result
        try:
            client = uus.client()
            if client.auth_imm(host_id, userid, passowrd):
                result ={"status": "success", "msg": "success"}
            else:
                result ={"status": "failed", "msg": "auth failed"}
            return result
        except Exception as e:
            result = {"status": "failed", "msg": str(e)}
            return result



@urls.register
class HostEventLogs(generic.View):
    url_regex = r'uus/host/(?P<host_id>[^/]+)/eventlogs$'

    @rest_utils.ajax()
    def get(self, request, host_id):
        client = uus.client()
        result = client.show_imm_log(host_id)
        return result

@urls.register
class HostPowerHistory(generic.View):
    url_regex = r'uus/host/(?P<host_id>[^/]+)/power_hisroty$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, host_id):
        interval = request.DATA.get('interval')
        duration = request.DATA.get('duration')
        if interval is None or duration is None:
            result = {"status": "failed", "msg": "NULL interval or duration"}
            return result
        try:
            client = uus.client()
            result = client.show_host_power_history(host_id, interval, duration)
            return result
        except Exception as e:
            result = {"status": "failed", "msg": str(e)}
            return result

@urls.register
class HostPowerCapping(generic.View):
    url_regex = r'uus/host/(?P<host_id>[^/]+)/power_capping$'

    @rest_utils.ajax()
    def get(self, request, host_id):
        try:
            client = uus.client()
            result = client.show_host_power_capping(host_id)
            return result
        except Exception as e:
            result = {"status": "failed", "msg": str(e)}
            return result

    @rest_utils.ajax(data_required=True)
    def post(self, request, host_id):
        newCap = request.DATA.get('newCap')
        if newCap is None:
            result = {"status": "failed", "msg": "newCap is NULL"}
            return result
        try:
            client = uus.client()
            result = client.set_host_power_capping(host_id, newCap)
            return result
        except Exception as e:
            result = {"status": "failed", "msg": str(e)}
            return result

@urls.register
class Switches(generic.View):
    url_regex = r'uus/switches/$'

    @rest_utils.ajax()
    def get(self, request):
        client = uus.client()
        switch_result = client.list_switches()
        pm_result = client.list_portmapping_switches()

        pm_index = dict()
        for pm_switch in pm_result:
            switch_ip = pm_switch['switch_ip']
            pm_index[switch_ip] = pm_switch

        result_data = []
        for endpoint in switch_result:
            switch = endpoint.copy()
            switch_ip = switch['switch_ip']
            pm_switch = pm_index[switch_ip]
            switch['pmswitch_id'] = pm_switch['uuid']
            switch['username'] = pm_switch['username']
            switch['ssh_port'] = pm_switch['ssh_port']
            switch['os_type'] = pm_switch['os_type']
            switch['protocol'] = pm_switch['protocol']
            result_data.append(switch)
        return {
            'items': result_data,
        }

    @rest_utils.ajax()
    def post(self, request):
        # Example of request data:
        # {
        #   "switch_ip": "10.240.253.201",
        #   "username": "admin",
        #   "ssh_port": "830",
        #   "os_type": "cnos",
        #   "password": "admin",
        #   "protocol" :"rest"
        #   "rest_tcp_port":"8090"
        # }

        try:
            switch_ip = request.DATA['switch_ip']
            ssh_port = request.DATA['ssh_port']
            username = request.DATA['username']
            password = request.DATA['password']
            os_type = request.DATA['os_type']
            protocol = request.DATA['protocol']
            client = uus.client()
            return_data = client.switch_discovery(switch_ip,
                                    username=username, password=password,
                                    os_type=os_type)

            client.add_portmapping_switch(switch_ip, ssh_port,
                                          username=username, password=password,
                                          os_type=os_type, protocol=protocol,
                                          rest_tcp_port=return_data.get("rest_tcp_port"))
            result ={"status":"success", "msg":"success"}
            return result
        except Exception as e:
            result ={"status":"failed", "msg": str(e)}
            return result

@urls.register
class Switch(generic.View):
    url_regex = r'uus/switch/(?P<switch_id>[^/]+)\+(?P<pmswitch_id>[^/]+)$'

    @rest_utils.ajax()
    def get(self, request, switch_id, pmswitch_id):
        LOG.info('Switch get switch_id = %s,pmswitch_id = %s' %(switch_id,pmswitch_id ))
        client = uus.client()
        switch_result = client.show_switch(switch_id)
        pm_result = client.show_portmapping_switch(pmswitch_id)
        if pm_result == {}:
            return pm_result
        result_data = switch_result.copy()
        result_data['pmswitch_id'] = pm_result['uuid']
        result_data['username'] = pm_result['username']
        result_data['ssh_port'] = pm_result['ssh_port']
        result_data['os_type'] = pm_result['os_type']
        if pm_result.has_key('rest_tcp_port'):
            result_data['rest_tcp_port'] = pm_result['rest_tcp_port']
        result_data['protocol'] = pm_result['protocol']
        return result_data

    @rest_utils.ajax()
    def delete(self, request, switch_id, pmswitch_id):
        try:
            client = uus.client()
            client.delete_switch(switch_id)
            client.delete_portmapping_switches(pmswitch_id)
            result ={"status":"success", "msg":"success"}
            return result
        except Exception as e:
            result ={"status":"failed", "msg": str(e)}
            return result

    @rest_utils.ajax()
    def put(self, request, switch_id, pmswitch_id):
        try:
            username = request.DATA['username']
            password = request.DATA['password']
        except KeyError as e:
            raise rest_utils.AjaxError(400, _("Post Data Error: %s" % unicode(e)))
        try:
            client = uus.client()
            client.update_switch_user(switch_id,
                                  username=username,
                                  password=password)
            client.update_portmapping_switch(pmswitch_id,
                                             username=username,
                                             password=password)
            result ={"status":"success", "msg":"success"}
            return result
        except Exception as e:
            result ={"status":"failed", "msg": str(e)}
            return result

@urls.register
class SwitchPortMapping(generic.View):
    url_regex = r'uus/switch/(?P<switch_id>[^/]+)\+(?P<pmswitch_id>[^/]+)/portmapping$'

    @rest_utils.ajax()
    def get(self, request, switch_id, pmswitch_id):
        client = uus.client()
        result = client.list_portmapping_nodes(pmswitch_id)
        return {
            'port_mapping': result
        }

    @rest_utils.ajax()
    def post(self, request, switch_id, pmswitch_id):
        try:
            mapping_info = request.DATA.get("port_mapping")

            client = uus.client()
            client.add_portmapping_nodes(pmswitch_id, mapping_info)
            result ={"status":"success", "msg":"success"}
            return result
        except Exception as e:
            result ={"status":"failed", "msg": str(e)}
            return result

    @rest_utils.ajax()
    def delete(self, request, switch_id, pmswitch_id):
        try:
            param_nodes = request.GET.get('nodes')

            LOG.info('Param_nodes = %s' %(param_nodes))

            if param_nodes is None:
                raise rest_utils.AjaxError(400, _("Parameter 'nodes' required"))

            mapping_info = dict()
            delete_nodes = param_nodes.split(' ')

            LOG.info('Switch get switch_id = %s' %(delete_nodes))
            for node in delete_nodes:
                mapping_info[node] = ""

            client = uus.client()
            client.delete_portmapping_nodes(pmswitch_id, mapping_info)
            result ={"status":"success", "msg":"success"}
            return result
        except Exception as e:
            result ={"status":"failed", "msg": str(e)}
            return result

    @rest_utils.ajax()
    def patch(self, request, switch_id, pmswitch_id):
        try:
            mapping_info = request.DATA.get("port_mapping")

            client = uus.client()
            client.update_portmapping_nodes(pmswitch_id, mapping_info)
            result ={"status":"success", "msg":"success"}
            return result
        except Exception as e:
            result ={"status":"failed", "msg": str(e)}
            return result

@urls.register
class Upgrades(generic.View):
    """API for Upgrade records.
    """
    url_regex = r'uus/upgrades/$'

    @rest_utils.ajax()
    def get(self, request):
        client = uus.client()
        result = client.showall_upgradestatus()
        return {
            'items': result,
        }
             
    # @rest_utils.ajax()
    def post(self, request):
        if not hasattr(request, 'DATA'):
            request.DATA = request.POST

        data = request.FILES['image_file']
        result = self.getFile(request, data)
        return rest_utils.CreatedResponse("/api/uus/upgrade/", result)


    def getFile(self, request, vdata):
        # return {'status': 'success', 'msg': "success"}
        try:
            if isinstance(vdata, TemporaryUploadedFile):
                # Hack to fool Django, so we can keep file open in the new thread.
                vdata.file.close_called = True
            if isinstance(vdata, InMemoryUploadedFile):
                # Clone a new file for InMemeoryUploadedFile.
                # Because the old one will be closed by Django.
                vdata = SimpleUploadedFile(vdata.name,
                                        vdata.read(),
                                        vdata.content_type)
            dataFilename = vdata.name
            with open('/tmp/' + dataFilename, 'wb+') as destination:
                for chunk in vdata.chunks():
                    destination.write(chunk)
            # todo,add code to handle stuff after upload, kick off
            # destination.close()

            folder_str = time.strftime('%Y-%m-%d-%H-%M-%S',time.localtime(time.time()))
            status,output = commands.getstatusoutput(("cd /tmp;mkdir -p %s;unzip %s -d %s") % (folder_str, dataFilename, folder_str))

            if os.path.exists('/tmp/%s/upgrade.zip' % folder_str) == False or os.path.exists('/tmp/%s/signature' % folder_str) == False:
                # messages.error(request,_('Failed to validated the upgrade package! Please check if the package is a valid Lenovo upgrade package!'))
                status,output = commands.getstatusoutput("rm -rf /tmp/%s;rm -rf /tmp/%s" % (folder_str, dataFilename))
                msg =  'Failed to validated the upgrade package! Please check if the package is a valid Lenovo upgrade package!'
                return {'status': 'failed', 'msg': msg}

            if request.DATA['fileAction'] == 'unchecked':
                if os.path.exists('/tmp/%s/version.txt' % folder_str) == False:
                    status,output = commands.getstatusoutput("rm -rf /tmp/%s;rm -rf /tmp/%s" % (folder_str, dataFilename))
                    msg =  'Failed to validated the upgrade package! Please check if the package contains a version.txt file!'
                    return {'status': 'failed', 'msg': msg}
                else:
                    with open('/tmp/%s/version.txt' % folder_str) as versionFile:
                        data = {"UPGRADE_VERSION": "", "PATCH_ID": ""}
                        for line in versionFile.readlines():
                            props = line.split("=")
                            if props[0] in data:
                                data[props[0]] = props[1].strip("\r\n")
                    
                    
                    status,output = commands.getstatusoutput("rm -rf /tmp/%s;rm -rf /tmp/%s" % (folder_str, dataFilename))
                    client = uus.client()
                    LOG.info("data = %s" %data)
                    up_info = client.get_upgradestatus(data["PATCH_ID"])
                    LOG.info("upinfo = %s" %up_info)
                    retstr = "PREVISION =" + up_info + "      U" + "PGRADEVERSION =" + data["UPGRADE_VERSION"]
                    if len(data["UPGRADE_VERSION"].strip()) > 0:
                        return {'status': 'success', 'msg': retstr}
                    else:
                        msg =  'Failed to validated the upgrade package! Please specific a version in the version.txt file!'
                        return {'status': 'failed', 'msg': msg}

            if os.path.exists('/etc/hwmgmt/public.pem') == False:
                # messages.error(request,_('Failed to validated the upgrade package! Please quickly contact with our department of server.'))
                status,output = commands.getstatusoutput("rm -rf /tmp/%s;rm -rf /tmp/%s" % (folder_str, dataFilename))
                msg =  'Failed to validated the upgrade package! Please quickly contact with our department of server.'
                return {'status': 'failed', 'msg': msg}

            with open('/etc/hwmgmt/public.pem') as f, open('/tmp/%s/upgrade.zip' % folder_str) as message, \
                    open('/tmp/%s/signature' % folder_str) as signFile,open('/tmp/%s/version.txt' % folder_str) as versionFile:
                key = f.read()
                rsakey = RSA.importKey(key)
                verifier = Signature.new(rsakey)
                digest = SHA.new()
                digest.update(message.read())
                is_verify = verifier.verify(digest, base64.b64decode(signFile.read()))
                data = {"UPGRADE_VERSION": "", "PATCH_ID": ""}
                for line in versionFile.readlines():
                    props = line.split("=")
                    if props[0] in data:
                        data[props[0]] = props[1].strip("\r\n")
        
            if is_verify==False:
                # messages.error(request,_('Failed to validated the upgrade package! Please check if the package is a valid Lenovo upgrade package!'))
                status,output = commands.getstatusoutput("rm -rf /tmp/%s;rm -rf /tmp/%s" % (folder_str, dataFilename))
                msg =  'Failed to validated the upgrade package! Please check if the package is a valid Lenovo upgrade package!'
                return {'status': 'failed', 'msg': msg}
            status,output = commands.getstatusoutput("cd /tmp/%s;unzip upgrade.zip ;chmod +x /tmp/%s/*" % (folder_str,folder_str))
            execute_str = "/tmp/"+folder_str+"/upgrade.yml"
            #leverage uus to handle backend upgrade procedure, since it require root auth while we are running in as horizon user
            client = uus.client()
            return_code = 0
            try:
                with open('/tmp/%s/version.txt' % folder_str) as versionFile:
                    data = {}
                    for line in versionFile.readlines():
                        props = line.split("=")
                        data[props[0]] = props[1].strip("\r\n")
                data['workdir'] = folder_str
                return_code = client.startupgrade(execute_str, data)
                if return_code == 20301:
                    raise Exception
                msg =  'File uploaded successfully.'
                return {'status': 'success', 'msg': msg}
            except Exception as e:
                # exceptions.handle(request,_('The package can NOT work.'))
                if return_code == 20301 :
                    msg = "The package has already patched!"
                else :
                    msg = 'The package can NOT work.'
                return {'status': 'failed', 'msg': msg}
                
        
            # messages.success(request,
            #                  _('Patch file %s upload success.') %
            #                  vdata.name)
        except Exception as e:
            msg = 'Unable to upload patch file'
            # TODO(nikunj2512): Fix this once it is fixed in glance client
            # exceptions.handle(request, msg)
            return {'status': 'failed', 'msg': msg}


@urls.register
class PolicyHA(generic.View):
    """API for Upgrade records.
    """
    url_regex = r'uus/policyha/$'

    @rest_utils.ajax()
    def get(self, request):
        client = uus.client()
        result = client.list_computeha()
        return result

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        halist = request.DATA.get('halist')
        if halist is None:
            result = {"status": "failed", "msg": "No node is selected"}
            return result
        try:
            client = uus.client()
            result = client.set_computeha(halist)
            return result
        except Exception as e:
            result = {"status": "failed", "msg": str(e)}
            return result


@urls.register
class SecuritySettings(generic.View):
    """API for Security Settings records.
    """
    url_regex = r'uus/security/$'

    def __init__(self):
        """
        Constructor
        """
        # self.hide_groups = ['warnings', 'running', 'user', 'exceptions', 'aborts']
        self.hide_groups = ['everything', 'aborts']

    @rest_utils.ajax()
    def get(self, request):
        client = uus.client()
        # result = client.showall_upgradestatus()
        result = self.getData(request)
        return {
            'items': result
        }

    @rest_utils.ajax()
    def put(self, request):
        try:
            obsvtime = request.DATA['obsv']
            locktime = request.DATA['loct']
            loctimes = request.DATA['locc']
        except KeyError as e:
            raise rest_utils.AjaxError(400, _("Post Data Error: %s" % unicode(e)))

        try:
            client = uus.client()
            client.refresh_security_setting(obsvtime, locktime, loctimes)
            result = {"status": "success", "msg": "success"}
            return result
        except Exception as e:
            # result = {"status": "success", "msg": "success"}
            result = {"status": "failed", "msg": str(e)}
            return result

    def getData(self, request):

        local_settings_file = getattr(settings, 'LOCAL_SETTINGS_PATH', '/usr/share/openstack-dashboard/easystack_dashboard/local/local_settings.py')

        #loginObservationTime = getattr(settings, 'LOGIN_OBSERVATION_TIME', 300)
        #loginLockTime = getattr(settings, 'LOGIN_LOCK_TIME', 7200)
        #loginLockCount = getattr(settings, 'LOGIN_LOCK_COUNT', 5)

        loginObservationTime = 300
        loginLockTime = 7200
        loginLockCount = 5

        with open(local_settings_file) as localSettingsFile:
            for line in localSettingsFile:
                if line.startswith("LOGIN_OBSERVATION_TIME"):
                    loginObservationLine = line.split("=")
                    if len(loginObservationLine) > 1:
                        loginObservationTime = int(loginObservationLine[1].strip())

                if line.startswith("LOGIN_LOCK_TIME"):
                    loginLockTimeLine = line.split("=")
                    if len(loginLockTimeLine) > 1:
                        loginLockTime = int(loginLockTimeLine[1].strip())

                if line.startswith("LOGIN_LOCK_COUNT"):
                    loginLockCountLine = line.split("=")
                    if len(loginLockCountLine) > 1:
                        loginLockCount = int(loginLockCountLine[1].strip())

        return {
            'observation': loginObservationTime,
            'lockTime': loginLockTime,
            'lockCount': loginLockCount,
        }


def setting_refresh(nodes, currip):
    fab = fab_context(None,
                   # user=master_user,
                   user='root',
                   password='passw0rd',
                   hosts=nodes,
                   disable_known_hosts=True,
                   warn_only=True)
    results = {}
    with fab:
        results = execute(settings_refresh_cmd, currip)
    return results


def settings_refresh_cmd(currip):
    cmdline = "scp root@%s:/etc/openstack-dashboard/local_settings.py /etc/openstack-dashboard/"%currip
    status, output = commands.getstatusoutput(cmdline)
  
