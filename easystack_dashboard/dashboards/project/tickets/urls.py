from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template
from easystack_dashboard.dashboards.admin.tickets import views


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="project/tickets/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="project/tickets/form.html")),
    url(r'^ticket-detail/$',
        template.as_view(template_name="project/tickets/ticket-detail.html")),

)
