from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="admin/images/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="admin/images/form.html")),
    url(r'^image2volumeform/$',
        template.as_view(template_name="admin/images/image2volumeform.html")),
    url(r'^detail/(?P<image_id>[^/]+)/$',
        template.as_view(template_name="admin/images/detail.html")),
)
