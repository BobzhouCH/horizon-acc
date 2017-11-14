from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$', template.as_view(template_name="admin/volume_snapshots/table.html"),
        name='index'),
    url(r'^updatestatusform$',
        template.as_view(
            template_name="admin/volume_snapshots/updatestatusform.html"),
        name='updatestatusform'),
)
