from django.conf.urls import patterns
from django.conf.urls import url

from lenovo_dashboard.dashboards.lenovo.overview import views


urlpatterns = patterns(
    '',
    url(r'^$', views.IndexView.as_view(), name='index'),
)
