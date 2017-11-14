from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="admin/invcode/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="admin/invcode/form.html"),
        name='create'),
)
