from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template

from easystack_dashboard.dashboards.project.instances import views

INSTANCES = r'^(?P<instance_id>[^/]+)/%s$'
VIEW_MOD = 'easystack_dashboard.dashboards.project.instances.views'

urlpatterns = patterns(
    VIEW_MOD,
    url(r'^$',
        template.as_view(template_name="project/instances/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="project/instances/form.html")),
    url(r'^volume-form/$',
        template.as_view(template_name="project/instances/volume-form.html")),
    url(r'^floatingip-form/$',
        template.as_view(template_name="project/instances/floatingip-form.html")),
    url(r'^net-form/$',
        template.as_view(template_name="project/instances/net-form.html")),
    url(r'^rebuild-instance-form/$',
        template.as_view(template_name="project/instances/rebuild-instance-form.html")),
    url(r'^detail/$',
        template.as_view(template_name="project/instances/instance-detail.html")),
    url(r'^monitor/(?P<instance_id>[^/]+)/$',
        views.MonitorView.as_view(), name="monitor"),
    url(INSTANCES % 'consolelog.html',
        views.ConsoleOutputView.as_view(), name="consolelog"),
    url(INSTANCES % 'detail', 'DetailLimit', name='DetailLimit'),
    url(INSTANCES % 'monitormetadata', 'GetMonitorMetadata', name='GetMonitorMetadata'),
    url(INSTANCES % 'ovsmonitormetadata', 'GetOVSMonitorMetadata', name='GetOVSMonitorMetadata'),
    url(r'^security-group-form/$',
        template.as_view(template_name="project/instances/security-group-form.html")),
    url(r'^snapshot-form/$',
        template.as_view(template_name="project/instances/snapshot-form.html")),
    url(r'^resize-form/$',
        template.as_view(template_name="project/instances/resize-form.html")),
    url(r'^total-memory/$',
        template.as_view(template_name="project/instances/total-memory.html")),
    url(r'^hot-extend-disk-form/$',
        template.as_view(template_name="project/instances/hot-extend-disk-form.html")),
)
