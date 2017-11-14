from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template

urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="project/networks/table.html"), name='index'),
    url(r'^form/$',
        template.as_view(template_name="project/networks/form.html")),
    url(r'^networks-form/$',
        template.as_view(template_name="project/networks/networks-form.html")),
    url(r'^subnet-detail/(?P<subnet_id>[^/]+)/$',
                    template.as_view(template_name="project/networks/subnets/detail.html")),
    url(r'^detail/(?P<network_id>[^/]+)/$',
                        template.as_view(template_name="project/networks/detail.html")),
    url(r'^network-detail/$',
        template.as_view(template_name="project/networks/network-detail.html")),
    url(r'^subnet-detail/$',
                    template.as_view(template_name="project/networks/subnets/subnet-detail.html")),
    url(r'^sub-form/$',
        template.as_view(template_name="project/networks/sub-form.html")),
    url(r'^network-delete-form/$',
        template.as_view(template_name="project/networks/network-delete-form.html")),
)
