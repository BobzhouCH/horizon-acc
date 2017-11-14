from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="project/network_policy/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="project/network_policy/nat_pool/form.html")),
    url(r'^l3_policy_form/$',
        template.as_view(template_name="project/network_policy/l3_policy/l3_policy_form.html")),
    url(r'^l3_policy_detail/$',
        template.as_view(template_name="project/network_policy/l3_policy/l3_policy_detail.html")),
    url(r'^l2_policy_form/$',
        template.as_view(template_name="project/network_policy/l2_policy/l2_policy_form.html")),
    url(r'^service_policy_form/$',
        template.as_view(template_name="project/network_policy/service_policy/service_policy_form.html")),
    url(r'^external_connectivity_form/$',
        template.as_view(template_name="project/network_policy/external_connectivity/external_connectivity_form.html")),
)
