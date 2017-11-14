from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="project/vpn/table.html"), name='index'),
    url(r'^ikepolicies-form/$',
        template.as_view(template_name="project/vpn/ikepolicies/ikepolicies-form.html")),
    url(r'^ikepolicy-detail/$',
        template.as_view(template_name="project/vpn/ikepolicies/ikepolicy-detail.html")),
    url(r'^ipsecpolicies-form/$',
        template.as_view(template_name="project/vpn/ipsecpolicies/ipsecpolicies-form.html")),
    url(r'^ipsecpolicy-detail/$',
        template.as_view(template_name="project/vpn/ipsecpolicies/ipsecpolicy-detail.html")),
    url(r'^vpnservices-form/$',
        template.as_view(template_name="project/vpn/vpnservices/vpnservices-form.html")),
    url(r'^vpnservice-detail/$',
        template.as_view(template_name="project/vpn/vpnservices/vpnservice-detail.html")),
    url(r'^ipsecsiteconns-form/$',
        template.as_view(template_name="project/vpn/ipsecsiteconns/ipsecsiteconns-form.html")),
    url(r'^ipsecsiteconn-detail/$',
        template.as_view(template_name="project/vpn/ipsecsiteconns/ipsecsiteconn-detail.html")),
)
