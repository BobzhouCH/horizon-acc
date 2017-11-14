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
"""API over the ceilometer service.
"""
import logging
import django.http
from django import http
from django.utils import http as utils_http
from django.views import generic
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.http.response import HttpResponse
from django.utils.datastructures import SortedDict

import copy
import re
import pytz
import json
from dateutil.parser import parse
from datetime import datetime  # noqa
from datetime import timedelta

from easystack_dashboard import api
from easystack_dashboard.api.rest import urls
from easystack_dashboard.api.rest import utils as rest_utils

LOG = logging.getLogger(__name__)

instance_meters = [{'name': 'cpu_util', 'unit': '%'},
                   {'name': 'memory.usage', 'unit': 'MB'},
                   {'name': 'disk.read.bytes.rate', 'unit': 'MB/s'},
                   {'name': 'disk.write.bytes.rate', 'unit': 'MB/s'}
                   ]

volume_meters = [{'name': 'volume.read.bytes.rate', 'unit': 'MB/s'},
                 {'name': 'volume.write.bytes.rate', 'unit': 'MB/s'},
                 ]

meter_unit = {'cpu_util': '%',
              'memory.usage': 'MB',
              'disk.read.bytes.rate': 'MB/s',
              'disk.write.bytes.rate': 'MB/s',
              'volume.read.bytes.rate': 'MB/s',
              'volume.write.bytes.rate': 'MB/s',
              'network.incoming.bytes.rate': 'MB/s',
              'network.outgoing.bytes.rate': 'MB/s',
              }

alarm_states = ['alarm', 'ok', 'insufficient_data']


@urls.register
class Meters(generic.View):
    url_regex = r'ceilometer/meters/$'

    @rest_utils.ajax()
    def get(self, request):
        LOG.debug('nfvpoc--get meters.')
        result = api.ceilometer.meter_list(request, **request.GET)
        return {'items': [u.to_dict() for u in result]}


def get_ip_rid(request):
    # get nic resources dic, key is instance_id
    query = [{"field": "project", "op": "eq", "value": request.user.tenant_id}]
    response = api.ceilometer.resource_list(request, query)
    resources = [u.to_dict() for u in response]
    instance_nic = {}
    for resource in resources:
        if (resource.get('type') == "nic") and resource.get('metadata'):
            mac = resource.get('metadata').get('mac')
            instance_id = resource.get('metadata').get('instance_id')
            rid = resource.get('resource_id')
            item = {"rid": rid, "mac": mac}
            if instance_nic.get(instance_id):
                instance_nic.get(instance_id).append(item)
            else:
                instance_nic.update({instance_id: [item]})
    ports = api.neutron.port_list(request, tenant_id=request.user.tenant_id)
    mac_ip = {}
    for port in ports:
        if hasattr(port, "fixed_ips") and len(port.fixed_ips) and hasattr(port, "mac_address") > 0:
            item = {port.mac_address: port.fixed_ips[0]['ip_address']}
            mac_ip.update(item)
    return instance_nic, mac_ip


@urls.register
class ResourceMeters(generic.View):
    url_regex = r'ceilometer/resourcemeters/$'

    @rest_utils.ajax()
    def post(self, request):
        resource_list = request.DATA
        result = []
        if len(resource_list) > 0:
            instance_nic, mac_ip = get_ip_rid(request)
            for res in resource_list:
                resource_id = res.get("resource_id")
                res_type = res.get("type")
                if res_type == 'instance':
                    _items = copy.deepcopy(instance_meters)
                    for item in _items:
                        item.update({'resource_id': resource_id})
                    nics = instance_nic.get(resource_id)
                    if nics:
                        for nic in nics:
                            _ip = mac_ip.get(nic.get("mac"))
                            if _ip is not None:
                                _items.append({'name': 'network.incoming.bytes.rate',
                                               'unit': 'MB/s',
                                               'resource_id': nic.get("rid"),
                                               'ip': _ip})
                                _items.append({'name': 'network.outgoing.bytes.rate',
                                               'unit': 'MB/s',
                                               'resource_id': nic.get("rid"),
                                               'ip': _ip})
                elif res_type == 'volume':
                    _items = copy.deepcopy(volume_meters)
                    for item in _items:
                        item.update({'resource_id': resource_id})
                else:
                    _items = []
                result.append(_items)
        return {'items': result}


@urls.register
class ResourceName(generic.View):
    url_regex = r'ceilometer/rename/(?P<resource_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, resource_id):
        items = get_resource_info(request, resource_id)
        return {'items': items}


def get_resource_info(request, resourceid):
    resource = api.ceilometer.resource_get(request, resourceid)
    name = None
    res_type = None
    dic = {}
    if resource is not None:
        if hasattr(resource, "resource_name"):
            name = resource.resource_name
        if hasattr(resource, "type"):
            res_type = resource.type
        else:
            if resource.metadata.has_key('event_type'):
                res_type = resource.metadata.get('event_type')
                res_type = res_type.split('.')[0]
            if resource.metadata.has_key('floating_ip_address'):
                res_type = 'floatingip'
        mac = resource.metadata.get('mac')
        if mac is not None:
            ip = get_ipaddress(request, mac)
            dic.update({'ip': ip})
            try:
                name = api.ceilometer.resource_get(
                    request, resource.metadata.get('instance_id')).resource_name
            except Exception as e:
                pass
        dic.update({'resource_name': name})
        dic.update({'resource_id': resourceid})
        dic.update({'resource_type': res_type})
    return dic


def get_ipaddress(request, mac):
    ports = api.neutron.port_list(request, **request.GET)
    ip_address = ''
    for port in ports:
        if mac == port.mac_address:
            for value in port.fixed_ips:
                if value.has_key('ip_address'):
                    ip_address = value.get('ip_address')
                    break
            break
    return ip_address


@urls.register
class Alarms(generic.View):
    url_regex = r'ceilometer/alarms/$'

    @rest_utils.ajax()
    @rest_utils.check_id_exist('alarm_id')
    def get(self, request):
        query = [
            {"field": "project", "op": "eq", "value": request.user.tenant_id}]
        result = api.ceilometer.alarm_list(request, query, **request.GET)
        #LOG.debug("nfvpoc-rest-get alarm:%s" % result)
        volume_result = api.cinder.volume_list(request)
        account_result = api.chakra.account_list(request)
        server_result, hasMore = api.nova.server_list(request)
        items = []
        resource_ids = []
        for uv in volume_result:
            resource_ids.append(uv.to_dict().get('id'))
        for un in server_result:
            resource_ids.append(un.to_dict().get('id'))
        for ut in account_result:
            resource_ids.append(unicode(ut.to_dict().get('id')))
        for u in result:
            rid = u.resourceid
            alarm_id = u.alarm_id
            dic = u.to_dict()
            #LOG.debug("nfvpoc-rest-get alarm:%s" % dic)
            create_time = format_time(u.timestamp)
            #create_time = get_alarm_create_time(request, alarm_id) ##change by laixf fix bug 120587
            dic.update({"create_time": create_time})
            if rid != None:
                dic.update(get_resource_info(request, rid))
                if rid in resource_ids:
                    items.append(dic)
        return {'items': items}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        body = request.DATA
        unit = meter_unit.get(body.get('threshold_rule').get('meter_name'))
        if unit == 'MB/s':
            body['threshold_rule']['threshold'] = body[
                'threshold_rule']['threshold'] * 1024 * 1024
        new_alarm = api.ceilometer.alarm_create(request,
                                                ceilometer_usage=None,
                                                **body)
        _dic = new_alarm.to_dict()
        _dic.update({'create_time': format_time(_dic.get('timestamp'))})
        return rest_utils.CreatedResponse(
            '/api/ceilometer/alarms/%s' % utils_http.urlquote(new_alarm.id),
            _dic
        )

@urls.register
class Alerts_history(generic.View):
    url_regex = r'ceilometer/alerts/history/$'

    @rest_utils.ajax()
    @rest_utils.check_id_exist('alarm_id')
    def get(self, request):
        query = [
            {"field": "project", "op": "eq", "value": request.user.tenant_id}]
        result = api.ceilometer.alert_list(request, query, **request.GET)
        #LOG.debug("nfvpoc-rest-get alert:%s" % result)
        #volume_result = api.cinder.volume_list(request)
        #account_result = api.chakra.account_list(request)
        #server_result, hasMore = api.nova.server_list(request)
        items = []
        for u in result:
            rid = u.resourceid
            alarm_name = u.name
            alarm_id = u.alarm_id
            severity = u.severity
            description = u.description
            dict_list = get_alarm_history(request, alarm_id)
            # add fields from alarms which alarm history don't have
            if dict_list:
                for alarm_dict in dict_list:
                    alarm_dict['name'] = alarm_name
                    try:
                        history_alarm_state = json.loads(alarm_dict['detail']).get('state')
                    except Exception:
                        history_alarm_state = 'insufficient_data'
                    alarm_dict['state'] = history_alarm_state
                    alarm_dict['description'] = description
                    alarm_dict['severity'] = severity
                    alarm_dict['create_time'] = format_time(alarm_dict['timestamp'])
                    items.append(alarm_dict)
            #else:
                # Alarm history caontains history and alarms which have no history
                #dict = u.to_dict
                #dict['create_time'] = format_time(dict['timestamp'])
                #items.append(dict)
        return {'items': items}

#added by laixf         
@urls.register
class Alerts_now(generic.View):
    url_regex = r'ceilometer/alerts/now/$'

    @rest_utils.ajax()
    @rest_utils.check_id_exist('alarm_id')
    def get(self, request):
        query = [
            {"field": "project", "op": "eq", "value": request.user.tenant_id}]
        result = api.ceilometer.alert_list(request, query, **request.GET)
        items = []
        for u in result:
            alarm_dict={}
           
            alarm_dict['alarm_id'] = u.alarm_id
            alarm_dict['name'] = u.name
            
            alarm_dict['severity'] = u.severity
            alarm_dict['state']=u.state
            alarm_dict['enabled'] = u.enabled
           
            alarm_dict['description'] = u.description
            timestamp = format_time(u.timestamp)
            alarm_dict['create_time']=timestamp
           
            items.append(alarm_dict)
        return {'items': items}

#added by laixf         
@urls.register
class Alerts_delete(generic.View):
    url_regex = r'ceilometer/alarm_clear/(?P<alarm_id>[^/]+)$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, alarm_id):
        result = api.ceilometer.alarm_delete(request, alarm_id)
        return result
    
    
   

@urls.register
class Alerts(generic.View):
    url_regex = r'ceilometer/alerts/$'

    @rest_utils.ajax()
    @rest_utils.check_id_exist('alarm_id')
    def get(self, request):
        query = [
            {"field": "project", "op": "eq", "value": request.user.tenant_id}]
        result = api.ceilometer.alert_list(request, query, **request.GET)
        items = []
        for u in result:
            dic = u.to_dict()
            create_time = format_time(dic['timestamp'])
            dic.update({"create_time": create_time})
            items.append(dic)
        return {'items': items}



@urls.register
class AlarmStates(generic.View):
    url_regex = r'ceilometer/alarmstates/$'

    @rest_utils.ajax()
    def get(self, request):
        return {'items': alarm_states}


@urls.register
class Notifications(generic.View):
    url_regex = r'ceilometer/notifications/(?P<data>.+|)$'

    @rest_utils.ajax()
    def get(self, request, data):
        ip = getattr(settings, 'ACCESS_URL', 'http://127.0.0.1')
        port = getattr(settings, 'ACCESS_PORT', '80')
        webroot = getattr(settings, 'WEBROOT', '/')[:-1]
        url = str(ip) + ":" + str(port) + webroot
        return HttpResponse(url, status=200)


@urls.register
class Alarm(generic.View):
    url_regex = r'ceilometer/alarms/(?P<alarm_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, alarm_id):
        alarm_list = api.ceilometer.alarm_get(request,
                                              alarm_id,
                                              ceilometer_usage=None,)
        alarm = alarm_list[0]
        resourceid = alarm_list[1]
        meter_name = None
        dic = alarm.to_dict()
        threshold_rule = dic.get('threshold_rule')
        if threshold_rule != None:
            meter_name = threshold_rule.get('meter_name')
        if meter_name != None:
            unit = meter_unit.get(meter_name)
            dic.update({'unit': unit})
            if unit == 'MB/s':
                value = dic.get('threshold_rule').get('threshold')
                if value:
                    dic['threshold_rule']['threshold'] = value / 1024 / 1024
        if resourceid is not None:
            dic.update(get_resource_info(request, resourceid))
        return dic

    @rest_utils.ajax(data_required=True)
    def patch(self, request, alarm_id):
        body = request.DATA
        unit = meter_unit.get(body.get('threshold_rule').get('meter_name'))
        if unit == 'MB/s':
            body['threshold_rule']['threshold'] = body[
                'threshold_rule']['threshold'] * 1024 * 1024
        return api.ceilometer.alarm_update(request,
                                           ceilometer_usage=None,
                                           **body).to_dict()

    @rest_utils.ajax()
    def delete(self, request, alarm_id):
        if alarm_id == 'default':
            raise django.http.HttpResponseNotFound('default')
        api.ceilometer.alarm_delete(request, alarm_id)
        return alarm_id


def get_alarm_history(request, alarm_id):
    items = api.ceilometer.alarm_history(request,
                                         alarm_id)
    LOG.debug('nfvpoc--get_alarm_history.')
    if items:
        alarm_list = [item.to_dict() for item in items]
    else:
        alarm_list = []
    return alarm_list

def get_alarm_create_time(request, alarm_id):
    items = api.ceilometer.alarm_history(request, alarm_id)
    create_time = None
    for item in items:
        item = item.to_dict()
        change_type = item.get('type')
        if change_type == "creation" or change_type == "state transition":
            create_time = item.get('timestamp')
            break
    return format_time(create_time)


# format "2015-07-30T12:08:43.433000" into "2015-07-30 12:08:43"
def format_time(time):
    if '.' in time:
        time = time.split('.')[0]
    if "T" in time:
        time = time.replace("T", " ")
    return time


@urls.register
class Resources(generic.View):
    url_regex = r'ceilometer/resources/$'

    @rest_utils.ajax()
    def get(self, request):
        query = [{"field": "project", "op": "eq", "value": request.user.tenant_id},
                 {"field": "metadata.event_type", "op": "eq", "value": None}]
        result = api.ceilometer.resource_list(request, query, **request.GET)
        items = [u.to_dict() for u in result]
        newitems = []
        for item in items:
            type = item['type']
            if type in ['instance', 'volume']:
                resource_id = item['resource_id']
                if type == 'instance':
                    status = item['metadata'].get('status')
                    if status == 'active':
                        displayname = item['metadata'].get('display_name')
                        description = item['metadata'].get('display_description')
                        newitems.append({'resource_id': resource_id,
                                         'displayname': displayname,
                                         'description': description,
                                         'type': type})
                elif type == 'volume':
                    displayname = item['metadata'].get('name')
                    description = item['metadata'].get('description')
                    newitems.append({'resource_id': resource_id,
                                     'displayname': displayname,
                                     'description': description,
                                     'type': type})
        return {'items': newitems}


@urls.register
class Samples(generic.View):
    url_regex = r'ceilometer/sample/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.ceilometer.sample_list(request, **request.GET)
        return {'items': [u.to_dict() for u in result]}


@urls.register
class RealtimeSamples(generic.View):
    url_regex = r'ceilometer/realtime/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.ceilometer.realtime_show(request, **request.GET)
        return {'items': [u.to_dict() for u in result]}


@urls.register
class Statistics(generic.View):
    url_regex = r'ceilometer/statistics/$'

    @rest_utils.ajax()
    def get(self, request):
        meter_name = request.GET.get('meter_name')
        resource_id = request.GET.get('resource_id')
        date_options = request.GET.get('data_option', '1')
        instance_id = request.GET.get('instance_id', None)

        result = []
        if meter_name == 'network':
            nics = get_nics(request)
            for nic in nics:
                nic_statics = self.get_statics(request, nic['meter_name'],
                                               nic['resource_id'],
                                               date_options, instance_id)
                result.append({'meta': nic, 'nic_statics': nic_statics})
        else:
            result = self.get_statics(request, meter_name, resource_id,
                                      date_options, instance_id)
        return {'items': result}

    def get_statics(self, request, meter_name, resource_id, date_options,
                    instance_id=None):
        # date_options:
        # 1  --- one day
        # 7  --- one week
        # 30 --- one moth
        # 180 --- half year
        # 2   --- 2 seconds
        # 60  --- 60 seconds
        date_from = None
        LOG.debug("nfvpoc--get_statics m:%s." % meter_name)
        date_to = datetime.now()
        date_options = int(date_options)
        time_format = '%Y-%m-%dT%H:%M:%S'
        realtime_format = '%Y-%m-%dT%H:%M:%S'
        if (date_options == 1):
            period = 900
        elif (date_options == 7):
            period = 7200
        elif (date_options == 30 or date_options == 180):
            period = 86400
        elif (date_options == 2):
            period = 2
        elif (date_options == 60):
            period = 30
        else:
            period = 900

        try:
            if date_options == 2:
                date_from = datetime.utcnow() - timedelta(seconds=2)
                date_to = datetime.utcnow()
            elif date_options == 60:
                date_from = datetime.utcnow() - timedelta(seconds=3600)
                date_to = datetime.utcnow()
            else:
                date_from = datetime.utcnow() - \
                    timedelta(days=int(date_options))
                date_to = datetime.utcnow()

        except Exception:
            raise ValueError("The time delta must be an "
                             "integer representing days.")
        format_data = []
        if meter_name and resource_id:
            try:
                data = api.ceilometer.statistic_list(request,
                                                     meter_name=meter_name,
                                                     query=[{'field': 'timestamp',
                                                             'op': 'ge',
                                                             'value': date_from},
                                                            {'field': 'timestamp',
                                                             'op': 'le',
                                                             'value': date_to},
                                                            {'field': 'resource_id',
                                                             'op': 'eq',
                                                             'value': resource_id}],
                                                     period=period)
            except Exception as e:
                raise
                data = 'Unable to get (meter)% limit data.' % meter_name

            if date_options != 2:
                datalen = len(data)
                for i, statistic in enumerate(data):
                    # Fill zero data to format_date for first item
                    if i == 0:
                        data_time_from = datetime.strptime(
                            str(statistic.period_start),
                            time_format)
                        if data_time_from - timedelta(seconds=period) > date_from:
                            tmp_json1 = {
                                'count': 0,
                                'min': 0,
                                'max': 0,
                                'sum': 0,
                                'avg': 0,
                                'period_start': get_local_date(request, date_from),
                                'period_end': get_local_date(request, date_from),
                                'period': statistic.period}
                            tmp_json2 = {
                                'count': 0,
                                'min': 0,
                                'max': 0,
                                'sum': 0,
                                'avg': 0,
                                'period_start': get_local_date(request,
                                                               data_time_from - timedelta(seconds=period)),
                                'period_end': get_local_date(request,
                                                             data_time_from - timedelta(seconds=period)),
                                'period': statistic.period}
                            format_data.append(tmp_json1)
                            format_data.append(tmp_json2)

                    statistic.min = round(statistic.min, 2)
                    statistic.max = round(statistic.max, 2)
                    statistic.avg = round(statistic.avg, 2)
                    if meter_name == 'cpu_util':
                        statistic.min = format(statistic.min / 100, '.2%')
                        statistic.max = format(statistic.max / 100, '.2%')
                        statistic.avg = format(statistic.avg / 100, '.2%')
                    tmp_json = {'count': statistic.count, 'min': statistic.min,
                                'max': statistic.max, 'sum': statistic.sum,
                                'avg': statistic.avg,
                                'period_start': get_local_date(request,
                                                               datetime.strptime(str(statistic.period_start),
                                                                                 time_format)),
                                'period_end': get_local_date(request, datetime.strptime(
                                    str(statistic.period_end),
                                    time_format)),
                                'period': statistic.period}
                    format_data.append(tmp_json)

                    # Fill zero data to format_date for last item
                    if i == datalen - 1:
                        data_time_to = datetime.strptime(
                            str(statistic.period_end),
                            time_format)
                        if data_time_to + timedelta(seconds=period) < date_to:
                            tmp_json1 = {
                                'count': 0,
                                'min': 0,
                                'max': 0,
                                'sum': 0,
                                'avg': 0,
                                'period_start': get_local_date(request, date_to),
                                'period_end':  get_local_date(request, date_to),
                                'period': statistic.period}
                            tmp_json2 = {
                                'count': 0,
                                'min': 0,
                                'max': 0,
                                'sum': 0,
                                'avg': 0,
                                'period_start': get_local_date(request,
                                                               data_time_to + timedelta(seconds=period)),
                                'period_end': get_local_date(request,
                                                             data_time_to + timedelta(seconds=period)),
                                'period': statistic.period}
                            format_data.append(tmp_json1)
                            format_data.append(tmp_json2)
            else:
                realtimeid = resource_id
                if meter_name.find('network') == 0:
                    ports = api.neutron.port_list(
                        request, device_id=instance_id)
                    port_start = resource_id[-11:]
                    for port in ports:
                        if(port.id[0:11] == port_start):
                            realtimeid = port.id
                            break
                samples = api.ceilometer.realtime_show(request,
                                                       meter_name,
                                                       query=[{'field': 'resource_id',
                                                               'op': 'eq',
                                                               'value': realtimeid}])
                for sample in samples:
                    time = str(sample.timestamp)
                    time = time[:-6]
                    data_time_to = datetime.strptime(
                        time,
                        realtime_format)
                    sample.counter_volume = round(sample.counter_volume, 2)
                    if meter_name == 'cpu_util' and sample.counter_volume > 0:
                        sample.counter_volume = format(
                            sample.counter_volume / 100, '.2%')
                    tmp_json1 = {
                        'count': sample.counter_volume,
                        'min': sample.counter_volume,
                        'max': sample.counter_volume,
                        'sum': sample.counter_volume,
                        'avg': sample.counter_volume,
                        'period_start': get_local_date(request,
                                                       data_time_to + timedelta(seconds=period)),
                        'period_end': get_local_date(request,
                                                     data_time_to + timedelta(seconds=period)),
                        'period': 0}
                    format_data.append(tmp_json1)

        return format_data


@urls.register
class Activities(generic.View):
    url_regex = r'ceilometer/activities/(?P<num>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, num):
        data = api.ceilometer.events_list(request,
                                          query='{"=": {"project": "'+request.user.project_id+'"}}',
                                          limit=int(num))

        events = log_filter(self, request, data)
        return {'items': events}


@urls.register
class ActivitiesAll(generic.View):
    url_regex = r'ceilometer/activitiesall$'

    @rest_utils.ajax()
    def get(self, request):
        data = api.ceilometer.events_list(request,
                                          query='{"=": {"project": "'+request.user.project_id+'"}}')

        events = log_filter(self, request, data)
        return {'items': events}


@urls.register
class ActivitiesByDate(generic.View):
    url_regex = r'ceilometer/activitiesdate$'

    @rest_utils.ajax()
    def post(self, request):
        body = request.DATA
        start_time = get_local_date(request, parse(body['start']), 'Etc/GMT+8')
        end_time = get_local_date(request, parse(body['end']), 'Etc/GMT+8')
        # start_time = get_local_date(request, datetime.today() - timedelta(days=1))
        data = api.ceilometer.events_list(request,
                                          query='{"and":[{"=": {"project": "' + request.user.project_id + '"}},{">=": {"timestamp": "' + start_time + '"}},{"<=":{"timestamp": "'+ end_time +'"}}]}',)
        events = log_filter(self, request, data)
        return {'items': events}


@urls.register
class OverviewActivities(generic.View):
    url_regex = r'ceilometer/overviewactivities$'

    @rest_utils.ajax()
    def get(self, request):
        start_time = get_local_date(request,datetime.today() - timedelta(days=1))
        data = api.ceilometer.events_list(request,
                                          query='{"and":[{"=": {"project": "' + request.user.project_id + '"}},{">=": {"timestamp": "' + start_time + '"}}]}',)
        events = log_filter(self, request, data)
        return {'items': events}


def get_nics(request, instance_id=None, instance_name=None):
    if instance_id is None:
        instance_name = request.GET.get('instance_name')
        instance_id = request.GET.get('instance_id')

    i = 0
    nics = []
    ports = api.neutron.port_list(request, device_id=instance_id)

    for port in ports:
        if instance_id == port.device_id:
            rid = "%s-%s-tap%s" % (instance_name,
                                   instance_id,
                                   port.id[0:11])
            nics.append({'meter_name': 'network.incoming.bytes.rate',
                         'resource_id': rid,
                         'ip_address': port.fixed_ips[0]['ip_address'],
                         'index': i})
            nics.append({'meter_name': 'network.outgoing.bytes.rate',
                         'resource_id': rid,
                         'ip_address': port.fixed_ips[0]['ip_address'],
                         'index': i})
            i = i + 1
    return nics


def get_local_date(request, time, timezone='Asia/Shanghai'):
    # Todo(gcb) get timezone from django, current it always
    # returns UTC.
    current_tz = request.session.get(
        'django_timezone',
        request.COOKIES.get('django_timezone', 'UTC')),
    dt = parse(time.isoformat() + "+00")
    return dt.astimezone(
        pytz.timezone(timezone)).strftime('%Y-%m-%dT%H:%M:%S')


def str2date_event(string):
    ms = 0
    if '.' in string:
        ms = int(re.split('\D+', string.split('.')[1])[0])
        string = string.split('.')[0]
    if "+" in string:
        string = string.split('+')[0]
    if "T" in string:
        return datetime.strptime(string, "%Y-%m-%dT%H:%M:%S")
    return datetime.strptime(string, "%Y-%m-%d %H:%M:%S")


def log_filter(self, request, data):
    if request.user.is_superuser:
        client_keywords = ('project_id', 'domain_id', 'group_id')
        filters = rest_utils.parse_filters_kwargs(request, client_keywords)[0]
        v3, dda = api.keystone.is_default_domain_admin(request)
        if v3 and not dda:
            domain_id = api.keystone.get_effective_domain_id(request)
        if len(filters) == 0:
            filters = None
        user_list = None
        try:
            if api.keystone.is_cloud_admin(request):
                user_list = api.keystone.user_list(request)
            else:
                user_list = api.keystone.user_list(
                    request,
                    project=request.GET.get('project_id', None),
                    domain=request.GET.get('domain_id', domain_id),
                    group=request.GET.get('group_id', None),
                    filters=filters)
        except Exception:
            pass
        id_name_map = {}
        if user_list != None:
            for item in user_list:
                user = item.to_dict()
                id_name_map[user.get('id')] = user.get('name')
        tenant_dict = None
        try:
            tenants = api.keystone.tenant_list(request)
            tenant_dict = SortedDict([(t.id, t) for t in tenants[0]])
        except Exception:
            pass
    events = []
    # Operate time of each event should be the end time of the event minus it's start time,
    # so we must cache the end time which retrieve first for calculate it's operate time.
    cache_dict = {}
    security_groups = api.network.security_group_list(request)
    security_groups_dicts = SortedDict([(s.id, s) for s in security_groups])
    i = 1
    for d in data:
        s = d.to_dict()
        if s.get('event_type') in rest_utils.FILTER_LOG:
            event_type = rest_utils.ABSTRCT_EVENT_TYPE_NAME.get(
                s.get('event_type'))
            action = rest_utils.TRANSLATE_ACTION.get(
                s.get('event_type'))
            traits = s.get('traits')
            trait_resource_id = None
            trait_resource_name = None
            operation_time = 1  # Default value: 1s
            for t in traits:
                if (t.get('name') == 'resource_name'):
                    trait_resource_name = t.get('value')
                    break
                elif (t.get('name') == 'resource_id'):
                    trait_resource_id = t.get('value')
                    if trait_resource_name:
                        break

            for t in traits:
                if (t.get('name') == 'image_type'):
                    s['image_type'] = t.get('value')
                    break
            generated = s.get('generated')
            if (trait_resource_name != None and trait_resource_name != 'None'):
                resource_name = trait_resource_name
            elif (trait_resource_id != None):
                resource_name = trait_resource_id
            else:
                resource_name = ''
            if request.user.is_superuser:
                trait_operator_id = None
                for t in traits:
                    if t.get('name') == 'user_id':
                        trait_operator_id = t.get('value')
                        break
                if trait_operator_id != None:
                    operator_name = id_name_map.get(trait_operator_id)
                else:
                    operator_name = ''
            else:
                trait_operator_id = None

            if (s.get('event_type').find('.end') != -1):
                # If there has an extra ".end" activity, may caused by communication failure, the corresponding event's operate time set the default value: 1s.
                cache_dict[action + resource_name] = str2date_event(str(generated))
            # Some event has two activities, one for start and another for end, the start one should not displayed in dashboard.
            elif (s.get('event_type').find('.start') != -1):
                if cache_dict.get(action + resource_name):
                    during = cache_dict[action + resource_name] - str2date_event(str(generated))
                    operation_time = during.seconds
                    cache_dict[action + resource_name] = None
                    events_len = len(events) - 1
                    # Find out the corresponding activity in reverse order.
                    while (events_len >= 0):
                        if (events[events_len]['resource'] == resource_name):
                            if (events[events_len]['action'] == action):
                                events[events_len]['operation_time'] = operation_time
                                break
                        events_len -= 1
                # If there has an extra ".start" activity, drop it.
                continue
            timestamp = str2date_event(
                str(s.get('generated'))
            )
            timestamp = get_local_date(self.request, timestamp)
            if s.get('image_type') != 'snapshot':
                if s.get('event_type') == 'image.create':
                    action = 'Create Image'
                    if trait_operator_id != None and tenant_dict != None:
                        operator_name = tenant_dict.get(trait_operator_id).name
                elif s.get('event_type') == 'image.delete':
                    action = 'Delete Image'
                    if trait_operator_id != None and tenant_dict != None:
                        operator_name = tenant_dict.get(trait_operator_id).name
                elif s.get('event_type') == 'image.upload' or s.get('event_type') == 'image.update':
                    if trait_operator_id != None and tenant_dict != None:
                        operator_name = tenant_dict.get(trait_operator_id).name
            if (s.get('event_type').find('security_group_rule') == 0):
                resource_name = ''
                # sg_rule_id = None
                # sg_id = None
                # for t in traits:
                #     if (t.get('name') == 'resource_id'):
                #         sg_rule_id = t.get('value')
                #         break
                # for t in traits:
                #     if (t.get('name') == 'security_group_id'):
                #         sg_id = t.get('value')
                #         break
                # security_group = security_groups_dicts.get(sg_id)
                # if security_group:
                #     security_group_rules = security_group.security_group_rules
                #     for r in security_group_rules:
                #         if (r.get('id') == sg_rule_id):
                #             resource_name = r.get('protocol')
                #     if(resource_name == None):
                #         resource_name = ''
                # else:
                #     resource_name = ''
            event = {'id': i,
                      'action': action,
                      'resource': resource_name,
                      'timestamp': format_time(timestamp),
                      'operation_time': operation_time,
                      'type': event_type}
            if request.user.is_superuser:
                event['operatorname'] = operator_name
            events.append(event)
            i += 1
    return events
