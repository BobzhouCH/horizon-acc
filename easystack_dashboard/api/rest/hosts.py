"""API over the host.
"""
from django.views import generic
from easystack_dashboard import api
import urls
from easystack_dashboard.api.rest import utils as rest_utils


@urls.register
class KSM(generic.View):
    """API for host ksm feature.
    """
    url_regex = r'ksm/(?P<host_id>[^/]+)$'

    @rest_utils.ajax()
    def get(self, request, host_id):
        try:
            result = api.nova.host_ksm_ctl(request, host_id, "show")
            result = result[1]
        except Exception as e:
            result = {"status": "failed", "msg": str(e)}
        return result


    @rest_utils.ajax(data_required=True)
    def patch(self, request, host_id):
        action = request.DATA.get('action', 'none')

        try:
            result = api.nova.host_ksm_ctl(request, host_id, action)
            result = result[1]
        except Exception as e:
            result = {"status": "failed", "msg": str(e)}
        return result


@urls.register
class ZRAM(generic.View):
    """API for host zram feature.
    """
    url_regex = r'zram/(?P<host>[^/]+)$'

    @rest_utils.ajax()
    def get(self, request, host):
        try:
            result = api.nova.host_get_zram_status(request, host)
            result = result[1]
        except Exception as e:
            result = {"status": "failed", "msg": str(e)}
        return result


    @rest_utils.ajax(data_required=True)
    def patch(self, request, host):
        action = request.DATA.get('action', 'none')

        try:
            result = api.nova.host_zram_ctl(request, host, action)
            result = result[1]
        except Exception as e:
            result = {"status": "failed", "msg": str(e)}
        return result
