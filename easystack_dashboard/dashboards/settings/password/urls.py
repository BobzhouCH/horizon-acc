from django.conf.urls import patterns
from django.conf.urls import url
from django.views.generic import TemplateView as template


urlpatterns = patterns(
    '',
    url(r'^$',
        template.as_view(template_name="settings/password/form.html"),
        name="index"),
    #begin:<wujx9>:<new feature(license)>:<action (a)>:<date(2016-11-16)>
    url(r'^license/$',
        template.as_view(template_name="settings/password/license.html")),
    #end:<wujx9>:<new feature(license)>:<action (a)>:<date(2016-11-16)>
    url(r'^logout_form/$',
        template.as_view(template_name="settings/password/logout_form.html"))
)
