from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="project/ports/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="project/ports/form.html")),
    url(r'^detail/$',
        template.as_view(template_name="project/ports/portDetail.html")),
    url(r'^port-security-group/$',
        template.as_view(template_name="project/ports/security-groups-form.html")),
)