from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="admin/volumes/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="admin/volumes/form.html")),
    url(r'^updatestatusform/$',
        template.as_view(template_name="admin/volumes/updatestatusform.html")),
)
