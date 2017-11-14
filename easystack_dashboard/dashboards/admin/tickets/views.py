# coding: utf-8
# vim: tabstop=4 shiftwidth=4 softtabstop=4

# Copyright 2016 EasyStack, Inc.
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
import json

from django import shortcuts
from django.http.response import HttpResponse
from django.utils.translation import ugettext as _
from easystack_dashboard import api
from easystack_dashboard.utils.xls_util import XLSWriter
from easystack_dashboard.api.rest import utils as rest_utils
import horizon
import time

xls_fields = ('no', 'title', 'user_name', 'type_name', 'project_name', 'requester_project_id', 'status_name', 'update_at', 'create_at')
xls_header = (_('Ticket No'), _('Title'), _('User'), _('Ticket Type'), _('Project Name'), _('Project ID'), _('Status'), _('Updated Time'), _('Created Time'))


def ticket_download(request):
    v3, is_default_admin = api.keystone.is_default_domain_admin(request)
    if request.user.is_authenticated() and is_default_admin:

        tickets =  _get_tickets(request)
        xls_data = [_filter_fields(ticket) for ticket in tickets]

        response = HttpResponse(mimetype='application/vnd.ms-excel')
        response['Content-Disposition'] = 'attachment;filename="{0}"'.format('tickets.xls')

        xls_writer = XLSWriter(response)
        xls_writer.add_sheet(xls_header, 'tickets')
        xls_writer.add_rows(xls_data, 'tickets')
        xls_writer.save()
        return response
    else:
        dashboard = horizon.get_default_dashboard()
        response = shortcuts.redirect(dashboard.get_absolute_url())
        return response


def _get_tickets(request):
    requester_id = request.user.id
    status_id = request.GET.get('status_id', None)
    type_id = request.GET.get('type_id', None)
    all_projects = request.GET.get('all_projects', None)

    if all_projects == 'true':
        requester_id = None

    body = {'requester_id': requester_id,
            'status_id': status_id,
            'type_id': type_id
            }
    for k in body.keys():
        if body[k] is None:
            del (body[k])

    tickets = api.ticket.ticket_list(request, **body)
    rest_utils.ensure_ticket_status_name(request, *tickets)
    rest_utils.ensure_ticket_type_name(request, *tickets)
    rest_utils.ensure_ticket_user_name(request, *tickets)
    rest_utils.ensure_ticket_project_name(request, *tickets)
    tickets.sort(key=_ticket_comp_fun, reverse=True)
    return tickets

def _filter_fields(ticket):
    row = []
    for item in xls_fields:
        row.append(ticket.get(item, ''))
    return row


def _ticket_comp_fun(ticket):
    created_at = ticket.get('created_at', None)
    if created_at is None:
        return -1
    try:
        second = int(time.mktime(time.strptime(created_at, '%Y-%m-%d %H:%M:%S')))
    except:
        return -1
    return second