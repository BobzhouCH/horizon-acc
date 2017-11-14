from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$', template.as_view(template_name="project/instance_snapshots/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="project/instance_snapshots/form.html")),
    url(r'^create_volume_form/$',
        template.as_view(template_name="project/instance_snapshots/create_volume_form.html")),
)
