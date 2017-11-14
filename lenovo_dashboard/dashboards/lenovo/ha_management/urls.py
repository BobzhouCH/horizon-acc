from django.conf.urls import patterns
from django.conf.urls import url

from lenovo_dashboard.dashboards.lenovo.ha_management import views


urlpatterns = patterns(
    '',
    url(r'^$', views.IndexView.as_view(), name='index'),
    url(r'^edit-ha-form$', views.EditHAView.as_view()),
)
