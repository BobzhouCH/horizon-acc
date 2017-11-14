# vim: tabstop=4 shiftwidth=4 softtabstop=4

# Copyright 2013 Kylin, Inc.
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

import re
import pytz
from dateutil.parser import parse
from datetime import datetime  # noqa
from datetime import timedelta  # noqa

from django.utils.translation import ugettext_lazy as _  # noqa
from django.utils.datastructures import SortedDict  # noqa

from horizon import tables
from horizon import exceptions

from easystack_dashboard import api
from easystack_dashboard.api import ceilometer
from easystack_dashboard.dashboards.project.activities \
    import tables as project_tables
from easystack_dashboard.utils import json_encoder


FILTER_LOG = ('volume.create.end',
              'volume.resize.end',
              'volume.delete.end',
              'volume.attach.end',
              'volume.detach.end',

              'compute.instance.pause.end',
              'compute.instance.unpause.end',
              'compute.instance.power_off.end',
              'compute.instance.power_on.end',
              'compute.instance.suspend',
              'compute.instance.resume',
              'compute.instance.create.end',
              'compute.instance.delete.end',
              'compute.instance.rebuild.end',
              'compute.instance.shutdown.end',
              'compute.instance.reboot.end',

              'image.delete',
              'image.upload',
              'image.update',

              'floatingip.create.end',
              'floatingip.delete.end',

              'router.create.end',
              'router.delete.end',
              'router.update.end',

              'network.create.end',
              'network.delete.end',
              'network.update.start',
              'network.update.end',
              'subnet.create.end',
              'subnet.delete.end',
              'subnet.update.end',

              'snapshot.create.end',
              'snapshot.delete.end',

              )


def get_local_date(request, time):
    current_tz = request.session.get(
        'django_timezone',
        request.COOKIES.get('django_timezone', 'UTC')),
    dt = parse(time.isoformat() + "+00")
    return dt.astimezone(
        pytz.timezone(current_tz[0])).strftime('%Y-%m-%dT%H:%M:%S')


class IndexView(tables.JSONTableMixin, tables.DataTableView):
    table_class = project_tables.ActivitiesTable
    template_name = 'project/activities/index.html'
    encoder_class = json_encoder.OSAPIJSONEncoder

    def get_data(self):
        request = self.request
        try:
            samples = []
            query = [{'field': 'project_id',
                      'op': 'eq',
                      'value': request.user.tenant_id}]
            data = ceilometer.sample_list(
                request,
                meter_name='volume,instance,network,subnet,snapshot,router,ip.floating@event@',
                query=query,
                limit=200)
            i = 0
            for s in data:
                if s.resource_metadata.get('event_type') in FILTER_LOG:
                    s.counter_type = str(timedelta(seconds=1).seconds)
                    if '.' in str(s.timestamp):
                        s.timestamp = str(s.timestamp).split('.')[0]
                    s.timestamp = datetime.strptime(
                        str(s.timestamp),
                        '%Y-%m-%dT%H:%M:%S')
                    s.timestamp = get_local_date(self.request, s.timestamp)
                    s.timestamp = str(datetime.strptime(
                        str(s.timestamp),
                        '%Y-%m-%dT%H:%M:%S'))
                    if s.counter_name == 'volume':
                        if s.resource_metadata.get('launched_at'):
                            launch_at = s.resource_metadata.get('launched_at')
                            create_at = s.resource_metadata.get('created_at')
                            create_at = str2date_event(str(create_at))
                            launch_at = str2date_event(str(launch_at))
                            during = launch_at - create_at
                            s.counter_type = during.seconds
                    elif s.counter_name == 'instance':
                        if s.resource_metadata.get('launched_at'):
                            launch_at = s.resource_metadata.get('launched_at')
                            create_at = s.resource_metadata.get('created_at')
                            create_at = str2date_event(str(create_at))
                            launch_at = str2date_event(str(launch_at))
                            during = launch_at - create_at
                            s.counter_type = during.seconds
                    s.resource_id = s.resource_metadata.get('display_name') or s.resource_metadata.get('name')\
                        or s.resource_metadata.get('floating_ip_address') or '-'
                    s.project_id = i
                    i = i + 1
                    samples.append(s)
        except Exception:
            data = []
            exceptions.handle(self.request,
                              _('Unable to get instance activities info.'))
        return samples


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


def get_log_local_date(request, time):
    current_tz = request.session.get(
        'django_timezone',
        request.COOKIES.get('django_timezone', 'UTC')),
    dt = parse(time.isoformat() + "+00")
    return dt.astimezone(
        pytz.timezone(current_tz[0])).strftime('%Y-%m-%d %H:%M:%S')
