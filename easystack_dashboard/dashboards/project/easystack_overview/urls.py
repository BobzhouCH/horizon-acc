from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    'easystack_dashboard.dashboards.project.easystack_overview.views',
    url(r'^$',
        template.as_view(
            template_name="project/easystack_overview/table.html"),
        name='index'),
    url(r'^switch_public/$', 'switch_public', name='switch_public'),
)
