from django.utils.translation import ugettext_lazy as _  # noqa

from horizon import tables


PTYPE = {
    'instance': _("Instance"),
    'volume': _("Volume"),
    'floating': _("Floating IP"),
    'image': _("Image"),
    'snapshot': _("Snapshot"),
}


class CreatePriceLink(tables.LinkAction):
    name = "create"
    verbose_name = _("Bind Price to Account")
    url = "horizon:admin:billing:prices:create_price"
    classes = ("ajax-modal", "btn-create")


def get_ptype(price):
    return PTYPE.get(getattr(price, "ptype", 0), '')


class PricesTable(tables.DataTable):
    id = tables.Column('id', verbose_name=_('ID'))
    ptype = tables.Column(get_ptype, verbose_name=_('Name'))

    class Meta:
        name = "prices"
        verbose_name = _("Prices")
        template = 'easystack_dashboard/common/_es_data_table.html'
        row_actions = (CreatePriceLink,)
        table_actions = ()
