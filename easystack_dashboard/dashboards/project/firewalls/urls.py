from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="project/firewalls/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="project/firewalls/form.html")),
    url(r'^rule-form/$',
        template.as_view(template_name="project/firewalls/rules/form.html")),
    url(r'^policy-form/$',
        template.as_view(template_name="project/firewalls/policies/form.html")),
)
