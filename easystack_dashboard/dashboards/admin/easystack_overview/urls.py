from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template

from easystack_dashboard.dashboards.admin.easystack_overview import views

urlpatterns = patterns(
    '',
    # url(r'^$',
    #     template.as_view(template_name="admin/easystack_overview/table.html"),
    #     name='index'),
    url(r'^$', views.IndexView.as_view(), name='index'),
)
