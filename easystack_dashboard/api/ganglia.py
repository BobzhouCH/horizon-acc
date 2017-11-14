# vim: tabstop=4 shiftwidth=4 softtabstop=4

# Copyright 2012 United States Government as represented by the
# Administrator of the National Aeronautics and Space Administration.
# All Rights Reserved.
#
# Copyright 2012 Nebula, Inc.
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

from __future__ import absolute_import


import os
import glob
import re
import logging
import socket
import select
import datetime
from dateutil.parser import parse
from horizon.utils import functions as utils
from xml.etree import ElementTree
from django.utils import timezone
from django.conf import settings  # noqa

LOG = logging.getLogger(__name__)

host_keys = ['cpu_num', 'cpu_speed', 'mem_total', 'disk_total',
             'machine_type', 'os_name', 'os_release']
default_metrics = ['cpu_wio', 'cpu_system', 'cpu_user', 'cpu_idle',
                   'mem_free', 'mem_cached', 'mem_shared', 'mem_buffers',
                   'disk_free', 'pkts_in', 'pkts_out', 'bytes_in',
                   'bytes_out', 'diskstat_\S*_writes',
                   'diskstat_\S*_reads',
                   'diskstat_\S*_write_bytes_per_sec',
                   'diskstat_\S*_read_bytes_per_sec']
hosts_cache = {}


class Elem:
    def __init__(self, elem):
        self.elem = elem

    def __getattr__(self, name):
        return self.elem.get(name.upper())


class NullElem:
    def __getattr__(self, name):
        return None


class MetricConstructor(Elem):
    def __init__(self, elem, host):
        self.host = host
        Elem.__init__(self, elem)
        self.metadata = dict()
        for extra_data in elem.findall("EXTRA_DATA"):
            for extra_elem in extra_data.findall("EXTRA_ELEMENT"):
                name = extra_elem.get("NAME")
                if name:
                    self.metadata[name] = extra_elem.get('VAL')
        try:
            self.metadata['NAME'], self.metadata['INSTANCE'] = \
                self.name.split('-', 1)
        except ValueError:
            self.metadata['INSTANCE'] = ''

        if self.name in ['fs_util', 'inode_util']:
            if self.instance == 'rootfs':
                self.metadata['INSTANCE'] = '/'
            else:
                self.metadata['INSTANCE'] = \
                    '/' + '/'.join(self.instance.split('-'))

    class Metric:
        def __init__(self, hostname, id, name, instance, group, title,
                     description, sum, num, value, units, type, sampleTime):
            self.hostname = hostname
            self.id = id
            self.name = name
            self.instance = instance
            self.group = group
            self.title = title
            self.description = description
            self.sum = sum
            self.num = sum
            self.value = value
            self.units = units
            self.type = type
            self.sampleTime = sampleTime

    def id(self):
        group = self.group if self.group is not None else ""
        id_elements = [self.host.name, group, self.name]
        return str.lower(
            ".".join(filter(lambda (e): e is not None, id_elements)))

    def craeate_metric(self):
        type, units = self.metric_type(self.type, self.units, self.slope)
        sample_time = datetime.datetime.fromtimestamp(
            int(self.host.reported) + int(self.host.tn) - int(self.tn))
        metric = self.Metric(self.host.name, self.id(),
                             self.name, self.instance,
                             self.group, self.title,
                             self.desc, self.sum, self.num,
                             self.is_num(self.val), units,
                             type, self.get_local_date(sample_time))
        return metric

    def get_local_date(self, time):
            current_tz = timezone.get_current_timezone()
            dt = parse(time.isoformat()+"+00")
            return dt.astimezone(current_tz).strftime('%Y-%m-%dT%H:%M:%S')

    def parse_tags(self, tag_string):
        if tag_string is None:
            return None
        else:
            tag_re = re.compile("\s+")
            tags = tag_re.split(tag_string)
            if "unspecified" in tags:
                return list()
            else:
                return tags

    def metric_type(self, type, units, slope):
        if units == 'timestamp':
            return 'timestamp', 's'
        if 'int' in type or type == 'float' or type == 'double':
            return 'gauge', units
        if type == 'string':
            return 'text', units
        return 'undefined', units

    def is_num(self, val):
        try:
            return int(val)
        except ValueError:
            pass
        try:
            return float(val)
        except ValueError:
            return val

    def __str__(self):
        return "%s %s %s %s %s %s" % (
            self.environment, self.grid.name,
            self.cluster.name, self.host.name,
            self.group, self.name)

    def __getattr__(self, name):
        try:
            if self.metadata.has_key(name.upper()):
                return self.metadata[name.upper()]
            else:
                return Elem.__getattr__(self, name)
        except AttributeError:
            return None

    def html_dir(self):
        return 'ganglia-' + self.environment + '-' + self.grid.name


class GangliaGmetad:
    hostname = getattr(settings, 'GANGLIA_URL', '127.0.0.1')

    def __init__(self, environment, service, xml_port, interactive_port):
        self.environment = environment
        self.service = service
        self.xml_port = xml_port
        self.interactive_port = interactive_port

    def read_data_from_port(self, host, port, send=None):
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            sock.connect((host, port))
            r, w, x = select.select([sock], [], [], 2)
            if not r:
                sock.close()
                return
        except socket.error, e:
            LOG.warning('Could not open socket to %s:%d - %s', host, port, e)
            return

        try:
            if send is not None:
                sock.send(send)
        except socket.error, e:
            LOG.warning('Could not send to %s:%d - %s', host, port, e)
            return

        buffer = ""
        while True:
            try:
                data = sock.recv(8192)
            except socket.error, e:
                LOG.warning(
                    'Could not receive data from %s:%d - %s',
                    host, port, e)
                return

            if not data:
                break
            buffer += data.decode("ISO-8859-1")

        sock.close()
        return buffer

    def read_xml_data(self):
        return self.read_data_from_port(self.hostname, self.xml_port)

    def read_xml_metrics(self, hostname):
        result = []

        xml_data = self.read_xml_data()
        if xml_data:
            try:
                ganglia = ElementTree.XML(xml_data)
            except UnicodeEncodeError:
                logging.error('Could not parse XML data')
                return result
        else:
            return result

        for grid_elem in ganglia.findall("GRID"):
            grid = Elem(grid_elem)
            for cluster_elem in grid_elem.findall("CLUSTER"):
                cluster = Elem(cluster_elem)
                for host_elem in cluster_elem.findall("HOST"):
                    host = Elem(host_elem)
                    hostMetric = Host(host.name, host.IP,
                                      host.reported,
                                      host.gmond_started)
                    hosts_cache[host.name] = hostMetric
                    result.append(hostMetric)
                    for metric_elem in host_elem.findall("METRIC"):
                        metric = MetricConstructor(metric_elem,
                                                   host).craeate_metric()
                        hostMetric.metrics.append(metric)
                        for key in host_keys:
                            if key == metric.name:
                                hostMetric.__dict__[key] = str(
                                    metric.value) + ' ' + metric.units
                                break
                        if metric.name == 'IPMI':
                            hostMetric.IPMI = metric.value

        return result

    def read_interactive_data(self):
        return self.read_data_from_port(self.hostname,
                                        self.interactive_port,
                                        '/?filter=summary\r\n')

    def read_metrics(self, host):
        xml_metrics = self.read_xml_metrics(host)
        return xml_metrics


class GangliaConfig:
    GANGLIA_PATH = '/etc/ganglia'

    def __init__(self):
        self.env_service_dict = self.parse_ganglia_config()

    def parse_ganglia_config(self):
        LOG.info("Parsing ganglia configurations")
        result = dict()
        environment = 'environment'
        service = 'service'
        ports = GangliaGmetad(environment, service, 8651, 8652)

        result[(environment, service)] = ports
        LOG.info('Found gmetad-%s-%s.conf with ports %d and %d',
                 environment, service, ports.xml_port,
                 ports.interactive_port)

        return result

    def get_gmetad_config(self):
        return self.env_service_dict.values()

    def get_gmetad_for(self, environment, service):
        def is_match(gmetad):
            env_match = \
                (not environment) or (gmetad.environment in environment)
            service_match = (not service) or (gmetad.service in service)
            return env_match and service_match

        return filter(is_match, self.env_service_dict.values())


class GmetadData():
    def __init__(self):
        self.data = dict()

    def collect(self, gmetad, host=None):
        LOG.info("  getting metrics for %s %s",
                 gmetad.environment,
                 gmetad.service)
        gmetad_metrics = gmetad.read_metrics(host)
        LOG.info("  updated %d metrics for %s %s",
                 len(gmetad_metrics),
                 gmetad.environment,
                 gmetad.service)
        self.data[(gmetad.environment, gmetad.service)] = gmetad_metrics
        return len(gmetad_metrics)

    def metrics_for(self, environment, service):
        try:
            return self.data[(environment, service)]
        except KeyError:
            return list()

    def metrics(self, gmetad):
        return self.metrics_for(gmetad.environment, gmetad.service)


class Host:
    def __init__(self, name, IP, reported, gmond_started):
        self.name = name
        self.IP = IP
        self.id = name
        self.reported = reported
        self.gmond_started = gmond_started
        self.metrics = []
        for key in host_keys:
            self.__dict__[key] = ' '

    def __eq__(self, other):
        if self.name == other.name:
            return True
        else:
            return False


def host_list_detailed(request, marker=None, filters=None, paginate=False):
    page_size = request.session.get('horizon_pagesize',
                                    getattr(settings, 'API_RESULT_PAGE_SIZE',
                                            20))
    has_more_data = False
    hostMetrics = _init_ganglia()
    if paginate:
        count = 0
        if marker:
            for inidex, hostMetric in enumerate(hostMetrics):
                if hostMetric.id == marker:
                    count = inidex + 1
                    break
        if count + page_size < len(hostMetrics):
            has_more_data = True
        hostMetrics = hostMetrics[count: count + page_size]

    return (hostMetrics, has_more_data)


def _init_ganglia():
    # global ganglia_config
    ganglia_config = GangliaConfig()

    # global ganglia_data
    ganglia_data = GmetadData()

    gmetad_list = ganglia_config.get_gmetad_config()
    LOG.info("Updating data from gmetad...")
    total_metrics = 0
    for counter, gmetad in enumerate(gmetad_list):
        metrics_for_gmetad = ganglia_data.collect(gmetad)
        total_metrics += metrics_for_gmetad
        LOG.debug("  (%d/%d) updated %d metrics for %s %s",
                  counter + 1, len(gmetad_list), metrics_for_gmetad,
                  gmetad.environment, gmetad.service)

    def is_match(metric):
        return True
    print("aaaaaaaaaaaaaaaaaaaaaaaaaa"+str(ganglia_data.data.keys()))
    hostMetrics = ganglia_data.data[(gmetad.environment, gmetad.service)]
    return hostMetrics


def host_detailed(request, host, query_metrics=None, paginate=False):
    hostMetrics = _init_ganglia()
    metrics = []
    if not query_metrics:
        query_metrics = default_metrics

    for hostMetric in hostMetrics:
        if hostMetric.name == host:
            for metric in hostMetric.metrics:
                for query_metric in query_metrics:
                    pattern = re.compile(r'^'+query_metric+'$')
                    if pattern.match(metric.name):
                        metrics.append(metric.__dict__)

    return metrics


def get_host(host):
    # As HAProxy exists so load the data again when can not get
    if host in hosts_cache:
        return hosts_cache[host]
    else:
        _init_ganglia()
        return hosts_cache[host]
