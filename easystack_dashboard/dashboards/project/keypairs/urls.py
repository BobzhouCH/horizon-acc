from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="project/keypairs/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="project/keypairs/form.html")),
    url(r'^newkeypair/$',
        template.as_view(template_name="project/keypairs/new-keypair.html")),
    url(r'^importform/$',
        template.as_view(template_name="project/keypairs/importform.html")),
)
