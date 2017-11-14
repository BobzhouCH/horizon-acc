from django import shortcuts
from easystack_dashboard.api import keystone
from django.conf import settings
from django.utils.translation import ugettext as _
from easystack_dashboard.api import billing
from easystack_dashboard.api import ceilometer
from easystack_dashboard.utils.xls_util import XLSWriter
from django.http.response import HttpResponse
from datetime import datetime
from datetime import timedelta
import horizon
import time

status_dic = {-1: 'deleted',
              0: 'disable',
              1: 'active',
              2: 'suspend',
              3: 'stop'}
xls_fields = ('resource_name', 'project_name', 'cost', 'fee', 'runtime', 'update_at', 'create_at')
xls_header = (_('Resource'), _('Project'), _('Cost'), _('Price') +'(' + _('Yuan/Hour') + ')',
              _('RunTime'), _('Update Time'), _('Create Time'))
runtime_str_format = '{0}' + _('Hour') + '{1}' + _('Minutes') + '{2}' + _('seconds')


def logout(request):
    webroot = getattr(settings, 'WEBROOT', '/')
    return shortcuts.redirect(webroot + 'auth/logout/')


def products_download(request, domain_id):
    if not request.user.is_authenticated():
        return logout(request)

    allow_download = True
    billing_enable = getattr(settings, 'ENABLE_BILLING', False)
    if not billing_enable or \
            not keystone.is_default_domain_admin(request)[1]:
        allow_download = False

    if allow_download:
        produncts =  _get_products(request, domain_id)
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


def _get_products(request, domain_id):
    if domain_id:
        query_field = "product.account_id"
        query_value = billing.get_account_id(request, domain_id=domain_id)
        query_type = "number"
        if query_value == None:
            return {"items": ""}
        query = [{"field": query_field,
                  "op": "eq",
                  "value": query_value,
                  "type": query_type,}]
    else:
        query = None

    params = ["pagation.number=1",
              "q.orderby=product.id",
              "q.sort=asc"]
    products = billing.product_list(request, query, params)
    items = [p.to_dict() for p in products]
    tenant_dict = {}

    tenants, has_more = keystone.tenant_list(request, domain=domain_id)
    for tenant in tenants:
        tenant_dict[tenant.id] = tenant.to_dict()

    try:
        _project_id_name = {}
        for item in items:
            item['status'] = status_dic.get(item['status'])
            resource = _get_resource_info(
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
                project = tenant_dict.get(item.get('project_id'))
                if not project:
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


def _get_resource_info(request, resourceid):
    resource = ceilometer.resource_get(request, resourceid)
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
        if mac is not None and not name:
            try:
                name = ceilometer.resource_get(
                    request, resource.metadata.get('instance_id')).resource_name
            except Exception as e:
                pass
        dic.update({'resource_name': name})
        dic.update({'resource_id': resourceid})
        dic.update({'resource_type': res_type})
    return dic

