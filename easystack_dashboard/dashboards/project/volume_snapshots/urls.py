from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$', template.as_view(template_name="project/volume_snapshots/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="project/volume_snapshots/form.html")),
    url(r'^snapshotform/$',
        template.as_view(template_name="project/volume_snapshots/snapshotform.html")),
)
