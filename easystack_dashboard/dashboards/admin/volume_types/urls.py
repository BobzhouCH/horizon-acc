from django.conf.urls import patterns  # noqa
from django.conf.urls import url  # noqa
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="admin/volume_types/table.html"),
        name='index'),
    url(r'^form/$',
        template.as_view(template_name="admin/volume_types/form.html")),
    url(r'^create-volumetype-form/$',
        template.as_view(template_name="admin/volume_types/create-volumetype-form.html")),
    url(r'^create-qosspec-form/$',
        template.as_view(template_name="admin/volume_types/create-qosspec-form.html")),
    url(r'^associate-qos-spec-form/$',
        template.as_view(template_name="admin/volume_types/associate-qosspec-form.html")),
    url(r'^add-extra-spec-form/$',
        template.as_view(template_name="admin/volume_types/add-extraspec-form.html")),
    url(r'^extra-spec-detail-table/$',
        template.as_view(template_name="admin/volume_types/extraspec-detail-table.html")),
    url(r'^extra-spec-detail-qos-table/$',
        template.as_view(template_name="admin/volume_types/extraspec-detail-qos-table.html")),
    url(r'^add-extra-spec-qos-form/$',
        template.as_view(template_name="admin/volume_types/add-extraspec-qos-form.html")),
    url(r'^add-extra-spec-help/$',
        template.as_view(template_name="admin/volume_types/add-extraspec-help.html")),
    url(r'^updatestatusform/$',
        template.as_view(template_name="admin/volume_types/updatestatusform.html")),
)