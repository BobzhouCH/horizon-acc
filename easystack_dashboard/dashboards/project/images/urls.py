
from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="project/images/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="project/images/form.html")),
    url(r'^image-detail/$',
        template.as_view(template_name="project/images/image-detail.html")),
    url(r'^detail/(?P<image_id>[^/]+)$',
        template.as_view(template_name="project/images/detail.html")),
    url(r'^image-create-volume-form/$',
        template.as_view(
            template_name="project/images/image-create-volume-form.html")),
)
