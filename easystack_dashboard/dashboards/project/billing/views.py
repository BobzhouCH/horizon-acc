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

import logging

from horizon import tabs

from django import shortcuts
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from easystack_dashboard.dashboards.project.\
    billing import tabs as project_tabs
from easystack_dashboard.api.onlinepay.alipay.alipay import AliPay
from easystack_dashboard.api.onlinepay.yeepay.yeepay import YeePay
from easystack_dashboard.api import keystone
from django.conf import settings
from django.utils.translation import ugettext as _
from easystack_dashboard.api import billing
from easystack_dashboard.api.rest import ceilometer
from easystack_dashboard.utils.xls_util import XLSWriter
from django.http.response import HttpResponse
from datetime import datetime
from datetime import timedelta
import horizon
import time

class IndexView(tabs.TabbedTableView):
    tab_group_class = project_tabs.DefaultsTabs
    template_name = 'project/billing/index.html'


LOG = logging.getLogger(__name__)
_alipay = AliPay()
_yeepay = YeePay()

status_dic = {-1: 'deleted',
              0: 'disable',
              1: 'active',
              2: 'suspend',
              3: 'stop'}
xls_fields = ('resource_name', 'status', 'cost', 'fee', 'runtime', 'update_at', 'create_at')
xls_header = (_('Resource'), _('Status'), _('Total Cost'), _('Price') +'(' + _('Yuan/Hour') + ')',
              _('RunTime'), _('Update Time'), _('Create Time'))
product_status = {
    'disable': _('Not Start Charge'),
    'active': _('Charging Now'),
    'suspend': _('Suspend(not charge)'),
    'stop': _('Stop(not charge)'),
    'deleted': _('Deleted'),
};
runtime_str_format = '{0}' + _('Hour') + '{1}' + _('Minutes') + '{2}' + _('seconds')

@csrf_exempt
def alipay_url_handler(request):
    """
    This handler for both asynchronous notify_url and
    synchronous return_url to updating billing payment.
    """
    LOG.info('>>url handler start...')
    if request.method == 'GET':
        data = request.GET
        notify_type = "sync"
    elif request.method == 'POST':
        data = request.POST
        notify_type = "async"
    return _alipay.handle_reponse(request, data, notify_type)


@csrf_exempt
def yeepay_url_handler(request):
    res_dic = request.POST.dict()
    if not res_dic:
        res_dic = request.GET.dict()

    if res_dic.get("r9_BType") == '1':
        notify_type = 'sync'
    elif res_dic.get("r9_BType") == '2':
        notify_type = 'async'
    return _yeepay.handle_reponse(request, res_dic, notify_type)


def index_account_view(request):
    if keystone.is_cloud_admin(request):
        return logout(request)
    return render(request, "project/billing/index_account.html")


def logout(request):
    webroot = getattr(settings, 'WEBROOT', '/')
    return shortcuts.redirect(webroot + 'auth/logout/')



def products_download(request):
    if not request.user.is_authenticated():
        return logout(request)

    allow_download = True
    billing_enable = getattr(settings, 'ENABLE_BILLING', False)
    if not billing_enable or \
            keystone.is_cloud_admin(request) or \
            keystone.is_dedicated_context(request) or \
            keystone.is_default_domain_member(request)[1]:
        allow_download = False

    if allow_download:
        produncts =  _get_products(request)
        produncts.sort(key=_product_comp_fun, reverse=True)
        xls_datas = [_filter_fields(product) for product in produncts]

        response = HttpResponse(mimetype='application/vnd.ms-excel')
        response['Content-Disposition'] = 'attachment;filename="{0}"'.format('bills.xls')

        xls_writer = XLSWriter(response)
        xls_writer.add_sheet(xls_header, 'bills')
        xls_writer.add_rows(xls_datas, 'bills')
        xls_writer.save()
        return response
    else:
        dashboard = horizon.get_default_dashboard()
        response = shortcuts.redirect(dashboard.get_absolute_url())
        return response


def _get_products(request):
    is_domain_admin = keystone.is_domain_admin(request)
    if not is_domain_admin[0]:
        return {"items": ""}
    if is_domain_admin[1]:
        query_field = "product.account_id"
        query_value = billing.get_account_id(request)
        query_type = "number"
        if query_value == None:
            return []
    else:
        query_field = "product.project_id"
        query_value = request.user.project_id
        query_type = "string"
    query = [{"field": query_field,
              "op": "eq",
              "value": query_value,
              "type": query_type,}]
    params = ["pagation.number=1",
              "pagation.count=1000",
              "q.orderby=product.id",
              "q.sort=asc"]
    products = billing.product_list(request, query, params)
    items = [p.to_dict() for p in products]
    try:
        _project_id_name = {}
        for item in items:
            item['status'] = status_dic.get(item['status'])
            resource = ceilometer.get_resource_info(
                request, item.get('resource_id'))
            if resource.get('resource_name'):
                item.update(
                    {'resource_name': resource.get('resource_name')})
            else:
                item.update({'resource_name': item.get('resource_id')})
            p_name = _project_id_name.get(item.get('project_id'))
            if p_name:
                item.update({'project_name': p_name})
            else:
                try:
                    project = keystone.tenant_get(
                        request, item.get('project_id'), admin=request.user.is_superuser).to_dict()
                except Exception:
                    continue
                if project.get('name'):
                    item.update({'project_name': project.get('name')})
                    _project_id_name.update(
                        {item.get('project_id'): project.get('name')})
                else:
                    item.update({'project_name': item.get('project_id')})
        return items
    except:
        return []

def _filter_fields(product):
    row = []
    _trans_fields(product)
    for item in xls_fields:
        row.append(product.get(item, ''))
    return row

def _trans_fields(data):
    data['status'] = product_status.get(data['status'], '')
    data['cost'] = '{:,.6f}'.format(data['cost']) if data['cost'] else ''
    data['fee'] = '{:,.4f}'.format(data['fee']) if data['fee'] else ''
    data['runtime'] = _runtime_format(data['runtime'])
    data['update_at'] = _time_format(data['update_at'])
    data['create_at'] = _time_format(data['create_at'])

def _runtime_format(seconds):
    if not isinstance(seconds,int):
        return ''
    hours = seconds/3600
    minutes = seconds%3600/60
    seconds = seconds%3600%60
    return runtime_str_format.format(hours, minutes, seconds)

def _time_format(datetime_str):
    datetime_format = "%Y-%m-%d %H:%M:%S"
    if not datetime_str:
        return ''
    try:
        new_datetime = datetime.strptime(datetime_str, datetime_format) + timedelta(hours=8)
        return new_datetime.strftime(datetime_format)
    except:
        return ''

def _product_comp_fun(product):
    create_at = product.get('create_at', None)
    if create_at is None:
        return -1
    try:
        second = int(time.mktime(time.strptime(create_at, '%Y-%m-%d %H:%M:%S')))
    except:
        return -1
    return second