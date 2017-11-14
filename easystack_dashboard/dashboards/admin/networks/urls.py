from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="admin/networks/table.html"),
        name='index'),
    url(r'^networks-form$',
        template.as_view(template_name="admin/networks/networks-form.html")),
    url(r'^sub-form$',
        template.as_view(template_name="admin/networks/sub-form.html")),
)
