from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="project/routers/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="project/routers/form.html")),
    url(r'^detail/(?P<routers_id>[^/]+)/$',
        template.as_view(template_name="project/routers/detail.html")),
    url(r'^connect/$',
        template.as_view(template_name="project/routers/connect.html")),
    url(r'^create-rule/$',
        template.as_view(template_name="project/routers/create-rule.html")),
    url(r'^routers-detail/$',
        template.as_view(template_name="project/routers/routers-detail.html"))
)
