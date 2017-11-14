from django.conf.urls import patterns
from django.conf.urls import url

from lenovo_dashboard.dashboards.lenovo.upgrade import views


urlpatterns = patterns(
    '',
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^upgrade/start/$', views.UpgradeStartView.as_view()),
)
