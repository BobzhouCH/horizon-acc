from django.conf.urls import patterns
from django.conf.urls import url

from lenovo_dashboard.dashboards.lenovo.ceph_mgmt import views


urlpatterns = patterns(
    '',
    url(r'^$', views.IndexView.as_view(), name='index'),
    # url(r'^detail/$', views.DetailView.as_view(), name='detail'),
    # url(r'^server/delete/$', views.DeleteServerView.as_view()),
    # url(r'^server/auth/$', views.AuthServerView.as_view()),
)
