from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="project/alerts/table.html"),
        name='index'),
    url(r'^alert-detail/$',
        template.as_view(template_name="project/alerts/alert-detail.html")),
    url(r'^detail/(?P<alert_id>[^/]+)$',
        template.as_view(template_name="project/alerts/detail.html")),
    )
