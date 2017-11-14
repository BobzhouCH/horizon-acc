from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="admin/flavors/table.html"),
        name='index'),
    url(r'^detail/$',
        template.as_view(template_name="admin/flavors/extra_specs/detail.html")),
    url(r'^extra-form/$',
        template.as_view(template_name="admin/flavors/extra_specs/extra_form.html")),
    url(r'^form/$',
        template.as_view(template_name="admin/flavors/form.html")),
)
