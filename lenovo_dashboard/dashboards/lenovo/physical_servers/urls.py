from django.conf.urls import patterns
from django.conf.urls import url

from lenovo_dashboard.dashboards.lenovo.physical_servers import views


urlpatterns = patterns(
    '',
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^detail/$', views.DetailView.as_view(), name='detail'),
    url(r'^server/delete/$', views.DeleteServerView.as_view()),
    url(r'^server/auth/$', views.AuthServerView.as_view()),
    url(r'^interface_config/$', views.InterfaceConfigEditView.as_view()),
    url(r'^monitor/(?P<instance_id>[^/]+)/$', views.MonitorView.as_view()),
)
