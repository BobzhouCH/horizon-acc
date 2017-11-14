
from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template
from easystack_dashboard.dashboards.admin.bill import views

urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="admin/bill/table.html"), name='index'),
    url(r'^download/(?P<domain_id>.+|)$', views.products_download,
        name="admin_bill_download"),
)
