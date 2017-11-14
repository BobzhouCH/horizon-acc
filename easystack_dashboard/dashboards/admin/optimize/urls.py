
from django.conf.urls import patterns
from django.conf.urls import url

from django.views.generic import TemplateView as template

urlpatterns = patterns(
    '',
    url(r'^$', template.as_view(template_name="admin/optimize/index.html"), name='index'),
    url(r'^prevOptimize/$',
        template.as_view(template_name="admin/optimize/create.html")),
    url(r'^log-detail/$',
        template.as_view(template_name="admin/optimize/detail.html")),
)
