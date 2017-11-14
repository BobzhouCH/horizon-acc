import logging
import json

from django.core.urlresolvers import reverse  # noqa
from django.core.urlresolvers import reverse_lazy  # noqa
from django.template import defaultfilters
from django.utils.translation import ugettext_lazy as _  # noqa

from horizon import tables
from horizon import exceptions

from easystack_dashboard.api import billing
from easystack_dashboard.api import chakra

LOG = logging.getLogger(__name__)


PTYPE = {
    'instance': _("Instance"),
    'volume': _("Volume"),
    'floatingIP': _("Floating IP"),
    'image': _("Image"),
    'snapshot': _("Snapshot"),
}

TYPE = {
    'combination': _("Combination"),
    'fix': _("Fix"),
    'multi': _("Mutiple"),
}


class CreateAccountLink(tables.LinkAction):
    name = "create"
    verbose_name = _("Create Billing Account")
    url = "horizon:admin:chakra:accounts:create"
    classes = ("ajax-modal", "btn-create")


class EditAccountLink(tables.LinkAction):
    name = "edit"
    verbose_name = _("Update Accounts")
    url = "horizon:admin:chakra:accounts:update"
    classes = ("ajax-modal", "btn-edit")


class AccountFilterAction(tables.FilterAction):
    def filter(self, table, accounts, filter_string):
        """ Naive case-insensitive search """
        q = filter_string.lower()
        return [account for account in accounts
                if q in account.name.lower()
                or q in account.id.lower()]


class EditPaymentLink(tables.LinkAction):
    name = "editpayment"
    verbose_name = _("Edit Payment")
    url = "horizon:admin:billing:accounts:update_payment"
    classes = ("ajax-modal", "btn-edit")


class DeleteAccount(tables.BatchAction):
    name = "delete"
    action_present = _("Delete")
    action_past = _("Delete")
    data_type_singular = _("Account")
    data_type_plural = _("Accounts")
    classes = ('btn-danger', 'btn-delete')

    def action(self, request, obj_id):
        billing_client = chakra.AccountBilling()
        billing_client.delete_account(obj_id)


class EditRules(tables.LinkAction):
    name = "edit_rules"
    verbose_name = _("Edit Rules")
    url = "horizon:admin:billing:accounts:detail"
    classes = ("btn-edit")


class AccountsTable(tables.DataTable):
    name = tables.Column('name',
                         verbose_name=_('Account Name'),
                         link='horizon:admin:billing:accounts:detail')
    balance = tables.Column('balance', verbose_name=_('Balance'))
    ref_resource = tables.Column('ref_resource', verbose_name=_('Project ID'),
                                 filters=[defaultfilters.urlize])

    class Meta:
        name = "account"
        verbose_name = _("Accounts")
        template = 'easystack_dashboard/common/_es_data_table.html'
        row_actions = (EditRules, EditAccountLink,
                       EditPaymentLink, DeleteAccount)
        table_actions = (AccountFilterAction, CreateAccountLink, DeleteAccount)


class CreatePriceItemLink(tables.LinkAction):
    name = "create"
    verbose_name = _("Create Price Item")
    url = "horizon:admin:billing:accounts:create_price_item"
    classes = ("ajax-modal", "btn-create")

    def get_link_url(self):
        return reverse(self.url, args=[self.table.kwargs['account_id']])

    def allowed(self, request, price=None):
        account_id = self.table.kwargs['account_id']
        billing_client = billing.PriceitemBilling()
        search_param = {"q.field": "price.account_id",
                        "q.op": "eq",
                        "q.value": int(account_id),
                        "pagation.number": 1,
                        "pagation.count": 100,
                        "q.type": "number",
                        "q.orderby": "price.id",
                        "q.sort": "asc"}
        prices, resultStatus = billing_client.list_prices(search_param)
        prices = json.loads(prices)
        if prices['prices']:
            return True
        return False


class DeletePrice(tables.BatchAction):
    name = "delete"
    action_present = _("Delete")
    action_past = _("Delete")
    data_type_singular = _("Price Template")
    data_type_plural = _("Price Templates")
    classes = ('btn-danger', 'btn-delete')

    def action(self, request, obj_id):
        billing_client = billing.PriceitemBilling()
        billing_client.delete_price(obj_id)


def get_ptype(price):
    return PTYPE.get(getattr(price, "ptype", 0), '')


class PricesTable(tables.DataTable):
    ptype = tables.Column(get_ptype, verbose_name=_('Type'))

    class Meta:
        name = "price"
        verbose_name = _("Price")
        template = 'easystack_dashboard/common/_es_data_table.html'
        row_actions = ()
        table_actions = (CreatePriceItemLink, DeletePrice)


class DeletePriceitem(tables.DeleteAction):
    data_type_singular = _("Price Item")
    data_type_plural = _("Price Items")

    def delete(self, request, obj_id):
        billing_client = billing.PriceitemBilling()
        billing_client.delete_priceitem(obj_id)


def get_price_name(priceitem):
    billing_client = billing.PriceitemBilling()
    price, resultStatus = \
        billing_client.get_price(str(priceitem.price_id))
    if resultStatus == 200:
        price = json.loads(price)
        return PTYPE.get(price['ptype'], '')
    else:
        price = ''
        return PTYPE.get(price['ptype'], '')


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
            return 'CPU: '+str(cpu)+'  Memory: '+str(mem)+'  OS: '+str(os)
        else:
            return priceitem['rule']
    else:
        priceitem = ''
        return priceitem


def get_type(price):
    return TYPE.get(getattr(price, "ptype", 0), '')


class PricesItemTable(tables.DataTable):
    price_name = tables.Column(get_price_name, verbose_name=_('Type'))
    fee = tables.Column('fee', verbose_name=_('Fee'))
    unit = tables.Column('unit', verbose_name=_('Unit'))
    ptype = tables.Column(get_type, verbose_name=_('Type'))
    rule = tables.Column(get_priceitem_rule, verbose_name=_('Rule'))

    class Meta:
        name = "priceitem"
        verbose_name = _("PricesItem")
        template = 'easystack_dashboard/common/_es_data_table.html'
        row_actions = ()
        table_actions = (DeletePriceitem,)
