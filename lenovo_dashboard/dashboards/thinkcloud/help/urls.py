from django.conf.urls import patterns
from django.conf.urls import url

from lenovo_dashboard.dashboards.thinkcloud.help import views


urlpatterns = patterns(
    '',
    url(r'^$', views.AboutView.as_view(), name='index'),
    url(r'^about$', views.AboutView.as_view(), name='about'),
    url(r'^support$', views.SupportView.as_view(), name='support'),
)
