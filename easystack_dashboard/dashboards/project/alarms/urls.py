from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="project/alarms/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="project/alarms/form.html")),
    url(r'^form_create_notice_list/$',
        template.as_view(
            template_name="project/alarms/form_create_notice_list.html")),
    url(r'^editform/$',
        template.as_view(template_name="project/alarms/editform.html"))
    )
