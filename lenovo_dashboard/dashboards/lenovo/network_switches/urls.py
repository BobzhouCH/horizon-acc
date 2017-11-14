from django.conf.urls import patterns
from django.conf.urls import url

from lenovo_dashboard.dashboards.lenovo.network_switches import views


urlpatterns = patterns(
    '',
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^detail/$', views.DetailView.as_view(), name='detail'),
    url(r'^switch/create/$', views.CreateSwitchView.as_view()),
    url(r'^switch/edit/$', views.EditSwitchView.as_view()),
    url(r'^switch/delete/$', views.DeleteSwitchView.as_view()),
    url(r'^detail/create/$', views.CreateDetailSwitchView.as_view()),
    url(r'^detail/edit/$', views.EditDetailSwitchView.as_view()),
    url(r'^detail/delete/$', views.DeleteDetailSwitchView.as_view())
)
