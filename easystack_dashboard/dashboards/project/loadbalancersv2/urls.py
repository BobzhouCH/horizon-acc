from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template

INSTANCES = r'^(?P<loadbalancer_id>[^/]+)/%s$'
VIEW_MOD = 'easystack_dashboard.dashboards.project.loadbalancersv2.views'

urlpatterns = patterns(
    VIEW_MOD,
    url(r'^$',
        template.as_view(template_name="project/loadbalancersv2/table.html"), name='index'),
    url(r'^form/$',
        template.as_view(template_name="project/loadbalancersv2/loadbalancer/form.html")),
    url(r'^detail/$',
        template.as_view(template_name="project/loadbalancersv2/loadbalancer/detail.html")),
    url(r'^pool-form/$',
        template.as_view(template_name="project/loadbalancersv2/pool/form.html")),
    url(r'^pool-detail/$',
        template.as_view(template_name="project/loadbalancersv2/pool/pool-detail.html")),
    url(r'^listener-form/$',
        template.as_view(template_name="project/loadbalancersv2/loadbalancer/listener_form.html")),
    url(r'^member-form/$',
        template.as_view(template_name="project/loadbalancersv2/pool/member-form.html")),
    url(r'^members-form/$',
        template.as_view(template_name="project/loadbalancersv2/pool/members-form.html")),
)
