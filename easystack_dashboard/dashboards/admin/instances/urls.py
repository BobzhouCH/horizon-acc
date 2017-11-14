from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="admin/instances/table.html"),
        name='index'),
    url(r'^live-migrate-form/$',
        template.as_view(template_name="admin/instances/live-migrate-form.html")),
    url(r'^form/$',
        template.as_view(template_name="admin/instances/form.html")),
    url(r'^snapshot-form/$',
        template.as_view(template_name="admin/instances/snapshot-form.html")),
)
