"""
Views for managing instances.
"""
import logging
import pytz
from dateutil.parser import parse
from datetime import datetime  # noqa
from datetime import timedelta  # noqa
from horizon import exceptions, views
from django import http
from django.conf import settings

from easystack_dashboard import api

from django import template

from oslo_serialization import jsonutils
LOG = logging.getLogger(__name__)

register = template.Library()


def get_local_date(request, time, timezone='Asia/Shanghai'):
    # Todo(gcb) get timezone from django, current it always
    # returns UTC.
    current_tz = request.session.get(
        'django_timezone',
        request.COOKIES.get('django_timezone', 'UTC')),
    dt = parse(time.isoformat() + "+00")
    return dt.astimezone(
        pytz.timezone(timezone)).strftime('%Y-%m-%dT%H:%M:%S')


def GetMonitorMetadata(request, instance_id):
    instance = api.nova.server_get(request, instance_id)
    instance_id = instance.id
    instance_name = getattr(instance,
                            'OS-EXT-SRV-ATTR:instance_name',
                            None)
    LOG.debug('nfvpoc---GetMonitorMetadata.i:%s' % instance_id)
    args = []
    compute = []
    args.append({'cpu_util': instance_id, 'meter': 'cpu_util', 'id': instance_id, 'name': 'CPU', 'unit': 'Unit: Percentage(%)'})
    args.append({'memory.usage': instance_id, 'meter': 'memory.usage', 'id': instance_id, 'name': 'Memory', 'unit': 'Unit: MB'})
    compute.append({'cpu_util': instance_id, 'index': 0})
    compute.append({'memory.usage': instance_id, 'index': 1})
    disk = []
    args.append({'disk.write.bytes.rate': instance_id, 'meter': 'disk.write.bytes.rate', 'id': instance_id, 'name': 'Disk Average rate of writes', 'unit': 'Unit: B/s'})
    args.append({'disk.read.bytes.rate': instance_id, 'meter': 'disk.read.bytes.rate', 'id': instance_id, 'name': 'Disk Average rate of reads', 'unit': 'Unit: B/s'})
    disk.append({'disk.write.bytes.rate': instance_id, 'index': 2})
    disk.append({'disk.read.bytes.rate': instance_id, 'index': 3})
    args.append({'disk.read.requests.rate': instance_id, 'meter': 'disk.read.requests.rate', 'id': instance_id, 'name': 'Disk Average requests of reads', 'unit': 'Unit: B/s'})
    args.append({'disk.write.requests.rate': instance_id, 'meter': 'disk.write.requests.rate', 'id': instance_id, 'name': 'Disk Average requests of writes', 'unit': 'Unit: B/s'})
    disk.append({'disk.read.requests.rate': instance_id, 'index': 4})
    disk.append({'disk.write.requests.rate': instance_id, 'index': 5})
    i = 6
    nic = []
    ports = api.neutron.port_list(request,
                                  device_id=instance_id)

    for port in ports:
        if(instance.id == port.device_id):
            nic_resources = []
            #rid = "%s-%s-tap%s" % (instance_name,
            rid = "%s-%s-vhu%s" % (instance_name,
                                   instance_id,
                                   port.id[0:11])
            args.append({'network.incoming.bytes.rate': {port.fixed_ips[0]['ip_address']: rid},
                         'meter': 'network.incoming.bytes.rate', 'id': rid,
                         'name': 'Network Bytes Received', 'unit': 'Unit: B/s', 'vname': port.fixed_ips[0]['ip_address']})
            args.append({'network.outgoing.bytes.rate':{port.fixed_ips[0]['ip_address']: rid},
                         'meter': 'network.outgoing.bytes.rate', 'id': rid,
                         'name': 'Network Bytes Sent', 'unit': 'Unit: B/s', 'vname': port.fixed_ips[0]['ip_address']})
            args.append({'network.incoming.packets.rate': {port.fixed_ips[0]['ip_address']: rid},
                         'meter': 'network.incoming.packets.rate', 'id': rid,
                         'name': 'Network Packets Received', 'unit': 'Unit: packet/s', 'vname': port.fixed_ips[0]['ip_address']})
            args.append({'network.outgoing.packets.rate':{port.fixed_ips[0]['ip_address']: rid},
                         'meter': 'network.outgoing.packets.rate', 'id': rid,
                         'name': 'Network Packets Sent', 'unit': 'Unit: packet/s', 'vname': port.fixed_ips[0]['ip_address']})
            nic_resources.append({'network.incoming.bytes.rate': rid, 'index': i})
            i += 1
            nic_resources.append({'network.outgoing.bytes.rate': rid, 'index': i})
            i += 1
            nic_resources.append({'network.incoming.packets.rate': rid, 'index': i})
            i += 1
            nic_resources.append({'network.outgoing.packets.rate': rid, 'index': i})
            i += 1
            nic.append({port.fixed_ips[0]['ip_address']: nic_resources})

    volumes = api.cinder.volume_list(request, {'all_tenants': 1})
    volumelist = []
    for volume in volumes:
        if volume.attachments:
            if (instance_id == volume.attachments[0]['server_id']):
                volume_resources = []
                vid = volume.attachments[0]['volume_id']
                args.append({'volume.write.bytes.rate': {volume.name: vid},
                             'meter': 'volume.write.bytes.rate', 'id': vid,
                             'name': 'Volume Write Bytes Rate', 'unit': 'Unit: B/s', 'vname': volume.name})
                args.append({'volume.read.bytes.rate': {volume.name: vid},
                             'meter': 'volume.read.bytes.rate', 'id': vid,
                             'name': 'Volume Read Bytes Rate', 'unit': 'Unit: B/s', 'vname': volume.name})
                volume_resources.append({'volume.write.bytes.rate': vid, 'index': i})
                i += 1
                volume_resources.append({'volume.read.bytes.rate': vid, 'index': i})
                i += 1
                volumelist.append({volume.name: volume_resources})

    content = jsonutils.dumps(args, sort_keys=settings.DEBUG)
    response = http.HttpResponse(status=200, content=content,
                                 content_type="application/json")
    #LOG.debug('nfvpoc---GetMonitorMetadata:%s' % response)
    return response

#NFVi OVS monitor START
def GetOVSMonitorMetadata(request, instance_id):
    args = []
    ovs_meter_list = []
    LOG.debug("nfv_poc---GetMonitorOVSMetadata:%s." % instance_id)
    i = 0
    hostname = instance_id
    meters= api.ceilometer.meter_list(request,None)
    for meter in meters:
        metername = meter.name
        resourceid = meter.resource_id
        if (metername == "ovs_stats.if_tx_octets"):
            if hostname[0:5] in resourceid:
                #LOG.debug("nfv_poc---meters:%s,%s" % (metername, resourceid))
	        args.append({'ovs_stats.if_tx_octets': resourceid,
                              'meter': metername, 'id': resourceid,
                              'name': metername, 'unit': 'Unit: B/s', 'vname': resourceid})
                ovs_meter_list.append({'ovs_stats.if_tx_octets': resourceid, 'index': i})
                i += 1
        elif (metername == "ovs_stats.if_rx_octets"):
            if hostname[0:5] in resourceid:
                #LOG.debug("nfv_poc---meters:%s,%s" % (metername, resourceid))
                args.append({'ovs_stats.if_rx_octets': resourceid,
                             'meter': metername, 'id': resourceid,
                             'name': metername, 'unit': 'Unit: B/s', 'vname': resourceid})
                ovs_meter_list.append({'ovs_stats.if_rx_octets': resourceid, 'index': i})
                i += 1
        elif (metername == "ovs_stats.if_packets"):
            if hostname[0:5] in resourceid:
                args.append({'ovs_stats.if_packets': resourceid,
                             'meter': metername, 'id': resourceid,
                             'name': metername, 'unit': 'Unit: packets/s', 'vname': resourceid})
                ovs_meter_list.append({'ovs_stats.if_packets': resourceid, 'index': i})
                i += 1

    content = jsonutils.dumps(args, sort_keys=settings.DEBUG)
    response = http.HttpResponse(status=200, content=content,
                                 content_type="application/json")
    #LOG.debug('nfvpoc---GetMonitorMetadata:%s' % response)
    return response
#NFVi OVS monitor END


def DetailLimit(request, instance_id):
    meter = request.GET.get('meter', None)
    rid = request.GET.get('rid', None)
    export = request.GET.get('export', None)
    date_options = request.GET.get('date_options', '1')
    date_from = request.GET.get('date_from', None)
    date_to = request.GET.get('date_to', datetime.now())
    date_options = int(date_options)
    time_format = '%Y-%m-%dT%H:%M:%S'
    realtime_format = '%Y-%m-%dT%H:%M:%S'
    period_name = ""

    if (date_options == 1):
        period = 900
        period_name = "oneday"
    elif (date_options == 7):
        period = 7200
        period_name = "oneweek"
    elif (date_options == 30 or date_options == 180):
        period = 86400
        period_name = "onemonth" if date_options == 30 else "halfyear"
    elif (date_options == 2):
        period = 2
    elif (date_options == 60):
        period = 30
    else:
        period = 900

    try:
        if date_options == 2:
            date_from = datetime.now() - timedelta(seconds=2)
            date_to = datetime.now()
        elif date_options == 60:
            date_from = datetime.now() - timedelta(seconds=3600)
            date_to = datetime.now()
        else:
            date_from = datetime.utcnow() - timedelta(days=int(date_options))
            date_to = datetime.utcnow()

    except Exception:
        raise ValueError("The time delta must be an "
                         "integer representing days.")
    format_data = []
    if meter and rid:
        if date_options != 2:
            try:
                data = api.ceilometer.statistic_list(
                    request, meter,
                    query=[{'field': 'timestamp',
                            'op': 'ge',
                            'value': date_from},
                           {'field': 'timestamp',
                            'op': 'le',
                            'value': date_to},
                           {'field': 'resource_id',
                            'op': 'eq',
                            'value': rid}], period=period)
            except Exception:
                data = _('Unable to get %s limit data.' % meter)
                exceptions.handle(request, ignore=True)

            datalen = len(data)
            for i, statistic in enumerate(data):
                # Fill zero data to format_date for first item
                if i == 0:
                    data_time_from = datetime.strptime(
                        str(statistic.period_start).split('.')[0],
                        time_format)
                    if data_time_from - timedelta(seconds=period) > date_from:
                        tmp_json1 = {
                            'count': 0,
                            'min': 0,
                            'max': 0,
                            'sum': 0,
                            'avg': 0,
                            'period_start': get_local_date(
                                request, date_from),
                            'period_end': get_local_date(
                                request, date_from),
                            'period': statistic.period}
                        tmp_json2 = {
                            'count': 0,
                            'min': 0,
                            'max': 0,
                            'sum': 0,
                            'avg': 0,
                            'period_start': get_local_date(
                                request,
                                data_time_from - timedelta(seconds=period)),
                            'period_end': get_local_date(
                                request,
                                data_time_from - timedelta(seconds=period)),
                            'period': statistic.period}
                        format_data.append(tmp_json1)
                        format_data.append(tmp_json2)

                statistic.min = round(statistic.min, 2)
                statistic.max = round(statistic.max, 2)
                statistic.avg = round(statistic.avg, 2)
                if meter == 'cpu_util':
                    statistic.min = format(statistic.min / 100, '.2%')
                    statistic.max = format(statistic.max / 100, '.2%')
                    statistic.avg = format(statistic.avg / 100, '.2%')
                tmp_json = {'count': statistic.count, 'min': statistic.min,
                            'max': statistic.max, 'sum': statistic.sum,
                            'avg': statistic.avg,
                            'period_start': get_local_date(
                                request, datetime.strptime(
                                    str(statistic.period_start).split('.')[0],
                                    time_format)),
                            'period_end': get_local_date(
                                request, datetime.strptime(
                                    str(statistic.period_end).split('.')[0],
                                    time_format)),
                            'period': statistic.period}
                format_data.append(tmp_json)

                # Fill zero data to format_date for last item
                if i == datalen - 1:
                    data_time_to = datetime.strptime(
                        str(statistic.period_end).split('.')[0],
                        time_format)
                    if data_time_to + timedelta(seconds=period) < date_to:
                        tmp_json1 = {
                            'count': 0,
                            'min': 0,
                            'max': 0,
                            'sum': 0,
                            'avg': 0,
                            'period_start': get_local_date(
                                request, date_to),
                            'period_end': get_local_date(
                                request, date_to),
                            'period': statistic.period}
                        tmp_json2 = {
                            'count': 0,
                            'min': 0,
                            'max': 0,
                            'sum': 0,
                            'avg': 0,
                            'period_start': get_local_date(
                                request,
                                data_time_to + timedelta(seconds=period)),
                            'period_end': get_local_date(
                                request,
                                data_time_to + timedelta(seconds=period)),
                            'period': statistic.period}
                        format_data.append(tmp_json1)
                        format_data.append(tmp_json2)
        else:
            realtimeid = rid
            if meter.find('network') == 0:
                ports = api.neutron.port_list(request,
                                              device_id=instance_id[18:54])
                port_start = rid[-11:]
                for port in ports:
                    if(port.id[0:11] == port_start):
                        realtimeid = port.id
                        break
            samples = api.ceilometer.realtime_show(
                request,
                meter,
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
                if meter == 'cpu_util' and sample.counter_volume > 0 :
                    sample.counter_volume = format(
                                            sample.counter_volume / 100, '.2%')
                tmp_json1 = {
                    'count': sample.counter_volume,
                    'min': sample.counter_volume,
                    'max': sample.counter_volume,
                    'sum': sample.counter_volume,
                    'avg': sample.counter_volume,
                    'period_start': get_local_date(
                        request, data_time_to + timedelta(seconds=period)),
                    'period_end': get_local_date(
                        request, data_time_to + timedelta(seconds=period)),
                    'period': 0}
                format_data.append(tmp_json1)

        if export == 'csv':
            content = _get_csv_report(format_data)
            file_name = "{meter}_{period_name}_{now}.csv".format(
                meter=meter,
                period_name=period_name,
                now=datetime.now()
            )
            file_name = file_name.replace(' ', '_').replace(':', '_')

            response = http.HttpResponse(status=200, content=content,
                                         content_type="text/csv")
            response['Content-Disposition'] = \
                'attachment; filename={filename}'.format(filename=file_name)
        else:
            content = jsonutils.dumps(format_data, sort_keys=settings.DEBUG)
            response = http.HttpResponse(status=200, content=content,
                                         content_type="application/json")

    return response


def _get_csv_report(data_array):
    array = ['min,max,sum,avg,start_time,end_time,duration']
    for item in data_array:
        line = '{min},{max},{sum},{avg},' \
               '{period_start},{period_end},{period}'.format(
                min=item.get('min', 0),
                max=item.get('max', 0),
                sum=item.get('sum', 0),
                avg=item.get('avg', 0),
                period_start=item.get('period_start', 0),
                period_end=item.get('period_end', 0),
                period=item.get('period', 0),)
        array.append(line)
    return '\r\n'.join(array)


class MonitorView(views.HorizonTemplateView):
    template_name = 'project/instances/monitor.html'

    def get_context_data(self, **kwargs):
        instance_id = self.kwargs['instance_id']
        instance = api.nova.server_get(self.request, instance_id)
        instance_id = instance.id
        instance_name = getattr(instance,
                                'OS-EXT-SRV-ATTR:instance_name',
                                None)
        args = []
        compute = []
        args.append({'cpu_util': instance_id})
        args.append({'memory.usage': instance_id})
        compute.append({'cpu_util': instance_id, 'index': 0})
        compute.append({'memory.usage': instance_id, 'index': 1})
        disk = []
        args.append({'disk.write.bytes.rate': instance_id})
        args.append({'disk.read.bytes.rate': instance_id})
        disk.append({'disk.write.bytes.rate': instance_id, 'index': 2})
        disk.append({'disk.read.bytes.rate': instance_id, 'index': 3})

        i = 4
        nic = []
        ports = api.neutron.port_list(self.request,
                                      device_id=instance_id)

        for port in ports:
            if(instance.id == port.device_id):
                nic_resources = []
                #rid = "%s-%s-tap%s" % (instance_name,
                rid = "%s-%s-vhu%s" % (instance_name,
                                       instance_id,
                                       port.id[0:11])
                args.append({'network.incoming.bytes.rate':
                            {port.fixed_ips[0]['ip_address']: rid}})
                args.append({'network.outgoing.bytes.rate':
                            {port.fixed_ips[0]['ip_address']: rid}})
                nic_resources.append({'network.incoming.bytes.rate': rid, 'index': i})
                i += 1
                nic_resources.append({'network.outgoing.bytes.rate': rid, 'index': i})
                i += 1
                nic.append({port.fixed_ips[0]['ip_address']: nic_resources})

        volumes = api.cinder.volume_list(self.request, {'all_tenants': 1})
        volumelist = []
        for volume in volumes:
            if volume.attachments:
                if (instance_id == volume.attachments[0]['server_id']):
                    volume_resources = []
                    vid = volume.attachments[0]['volume_id']
                    args.append({'volume.write.bytes.rate': {volume.name: vid}})
                    args.append({'volume.read.bytes.rate': {volume.name: vid}})
                    volume_resources.append({'volume.write.bytes.rate': vid, 'index': i})
                    i += 1
                    volume_resources.append({'volume.read.bytes.rate': vid, 'index': i})
                    i += 1
                    volumelist.append({volume.name: volume_resources})
        return {'compute': compute,
                'disk': disk,
                'nic': nic,
                'volume': volumelist,
                'resources': args,
                'instance_id': instance_id}


class ConsoleOutputView(views.HorizonTemplateView):
    template_name = 'project/instances/_consolelog.html'

    def get_context_data(self, **kwargs):
        instance_id = self.kwargs['instance_id']
        console_og = api.nova.server_console_output(self.request, instance_id)
        return {'console_log': console_og,
                'instance_id': instance_id}
