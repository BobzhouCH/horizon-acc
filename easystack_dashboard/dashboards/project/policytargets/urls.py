from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="project/policytargets/table.html"),
        name='index'),
    url(r'^internal-group-detail/$',
        template.as_view(
            template_name="project/policytargets/internal-group-detail.html")
        ),
    url(r'^external-group-detail/$',
        template.as_view(
            template_name="project/policytargets/external-group-detail.html"),
        ),
    url(r'^internal-group-form/$',
    template.as_view(
        template_name="project/policytargets/internal-group-form.html"),
    ),
    url(r'^external-group-form/$',
    template.as_view(
        template_name="project/policytargets/external-group-form.html"),
    ),
    url(r'^actionform/$',
        template.as_view(template_name="project/application_policy/policyaction/form.html")
    ),
    url(r'^classifierform/$',
        template.as_view(template_name="project/application_policy/policyclassifier/form.html")
    ),
    url(r'^ruleform/$',
        template.as_view(template_name="project/application_policy/policyrule/form.html")
    ),
    url(r'^rulesetform/$',
        template.as_view(template_name="project/application_policy/policyruleset/form.html")
    ),
    url(r'^external_connectivity_form/$',
        template.as_view(template_name="project/network_policy/external_connectivity/external_connectivity_form.html")
    ),
)
