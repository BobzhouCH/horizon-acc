from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="project/volumes/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="project/volumes/form.html")),
    url(r'^volume2imageform/$',
        template.as_view(template_name="project/volumes/volume2imageform.html")),
    url(r'^snapshotform/$',
        template.as_view(template_name="project/volumes/snapshotform.html")),
    url(r'^backupform/$',
        template.as_view(template_name="project/volume_backups/form.html")),
    url(r'^detail/$',
        template.as_view(template_name="project/volumes/volume-detail.html")),
)