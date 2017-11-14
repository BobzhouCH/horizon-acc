
from django.conf.urls import patterns
from django.conf.urls import url
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$', template.as_view(template_name="identity/domains/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="identity/domains/form.html")),
    url(r'^quota-form/$',
        template.as_view(template_name="identity/domains/quota-form.html")),
    url(r'^users-form/$',
        template.as_view(template_name="identity/domains/users-form.html")),
)
