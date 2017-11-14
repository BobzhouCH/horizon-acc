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
import json

from django.utils.translation import ugettext_lazy as _  # noqa

from horizon import tables

from easystack_dashboard.api import billing


STATES = {
    -1: _("deleted"),
    0: _("disable"),
    1: _("active"),
    2: _("suspend"),
    3: _("stop"),
}

PTYPE = {
    'instance': _("Instance"),
    'volume': _("volume"),
    'floating': _("floating ip"),
    'image': _("image"),
    'snapshot': _("snapshot"),
}


def get_price_name(priceitem):
    billing_client = billing.PriceitemBilling()
    price, resultStatus = \
        billing_client.get_price(str(priceitem.price_id))
    if resultStatus == 200:
        price = json.loads(price)
        return price['ptype']
    else:
        price = ''
        return price


def get_priceitem_rule(priceitem):
    billing_client = billing.PriceitemBilling()
    priceitem, resultStatus = \
        billing_client.get_priceitem(str(priceitem.id))
    if resultStatus == 200:
        priceitem = json.loads(priceitem)
        if priceitem['rule']:
            cpu = priceitem['rule']['cpu']
            mem = priceitem['rule']['mem']
            os = priceitem['rule']['os']
            return 'CPU: ' + str(cpu) + '  Memory: ' + str(mem) + '  OS: ' + str(os)
        else:
            return priceitem['rule']
    else:
        priceitem = ''
        return priceitem


class PriceItemTable(tables.DataTable):
    price_name = tables.Column(get_price_name, verbose_name=_('Product Type'))
    fee = tables.Column('fee', verbose_name=_('Fee'))
    unit = tables.Column('unit', verbose_name=_('Unit'))
    rule = tables.Column(get_priceitem_rule, verbose_name=_('Rule'))

    class Meta:
        name = "priceitem"
        verbose_name = _("PricesItem")
        template = 'easystack_dashboard/common/_es_data_table.html'
        row_actions = ()
        table_actions = ()


def get_product_name(product):
    billing_client = billing.ProductBilling()
    product, resultStatus = \
        billing_client.get_product(str(product.product_id))
    if resultStatus == 200:
        product = json.loads(product)
    else:
        product = ''
    return product['ptype']


def get_product_id(product):
    billing_client = billing.ProductBilling()
    product, resultStatus = \
        billing_client.get_product(str(product.product_id))
    if resultStatus == 200:
        product = json.loads(product)
    else:
        product = ''
    return product['resource_id']


def get_status(product):
    return STATES.get(getattr(product, "status", 0), '')


def get_ptype(product):
    return PTYPE.get(getattr(product, "ptype", 0), '')


class BillingItemTable(tables.DataTable):
    product_name = tables.Column(get_product_name, verbose_name=_('Product'))
    product_id = tables.Column(get_product_id, verbose_name=_('Product'))
    charge_fee = tables.Column('charge_fee', verbose_name=_('Fee'))
    charge_from = tables.Column('charge_from', verbose_name=_('Charge from'))
    charge_to = tables.Column('charge_to', verbose_name=_('Charge to'))

    class Meta:
        name = "billingitem"
        verbose_name = _("BillingItemTable")
        template = 'easystack_dashboard/common/_es_data_table.html'
        row_actions = ()
        table_actions = ()


class ProductTable(tables.DataTable):
    ptype = tables.Column(get_ptype, verbose_name=_('Product Type'))
    resource_id = tables.Column('resource_id', verbose_name=_('Resource'))
    cost = tables.Column('cost', verbose_name=_('Cost'))
    fee = tables.Column('fee', verbose_name=_('Fee'))
    status = tables.Column(get_status, verbose_name=_('Status'))
    update_at = tables.Column('update_at', verbose_name=_('Charge to'))

    class Meta:
        name = "billingproduct"
        verbose_name = _("BillingProductTable")
        template = 'easystack_dashboard/common/_es_data_table.html'
        row_actions = ()
        table_actions = ()
