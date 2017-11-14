__author__ = 'wujx'

import django.http
from django.views import generic

from easystack_dashboard import api
from easystack_dashboard.api.rest import utils as rest_utils

from easystack_dashboard.api.rest import urls
from horizon.utils.memoized import memoized
from django.conf import settings
from easystack_dashboard.api import base
# begin: wangzh21 Add auth to dcmgmt date:2017-01-05
from irsclient import client as dcmgmt_client
# end: wangzh21 Add auth to dcmgmt date:2017-01-05
from irsclient.client import get_client
#from dcmgmtclient.v1.optimization.vm_host_layouts import VmHostLayoutsManager
#from dcmgmtclient.v1.optimization.optimization import OptimizationsManager

@memoized
def optimizeclient(request):
    # begin: wangzh21 Add auth to dcmgmt date:2017-01-05
    endpoint = base.url_for(request, 'irs')
    insecure = getattr(settings, 'OPENSTACK_SSL_NO_VERIFY', False)
    cacert = getattr(settings, 'OPENSTACK_SSL_CACERT', None)
    return dcmgmt_client.Client('1', endpoint,
                                token=(lambda: request.user.token.id),
                                insecure=insecure,
                                cacert=cacert)
    # end: wangzh21 Add auth to dcmgmt date:2017-01-05

@urls.register
class VMHostLayouts(generic.View):
    url_regex = r'vm-host-layouts/$'

    @rest_utils.ajax(authenticated=False, data_required=False)
    def get(self, request):
        ret = dict()
        try:
            ori_nova_client = optimizeclient(request)
            id = request.GET['id']
            # new_client = VmHostLayoutsManager(ori_nova_client)
            # layouts = new_client.get_vm_host_layouts()
            layouts = ori_nova_client.vm_host_layout.get_vm_host_layout(id)
            import json
            layouts = json.loads(layouts)

            ret['success'] = True
            ret['resultObj'] = layouts.get('resultObj')
        except Exception as e:
            ret['success'] = False
            ret['resultObj'] = e.message
        return ret


@urls.register
class Optimaziton(generic.View):
    url_regex = r'optimizations/(?P<id>[0-9a-z_-]+|current-task)$'

    @rest_utils.ajax(authenticated=False, data_required=False)
    def get(self, request, id):
        ret = dict()
        try:
            ori_nova_client = optimizeclient(request)
            #new_client = OptimizationsManager(ori_nova_client)
            if id == 'current-task':
                aggregate_id = request.GET['aggregate_id']
                state = request.GET['state']
                opt_processing = ori_nova_client.optimization.get_optimization_processing_state(state, aggregate_id)
                import json
                opt_processing = json.loads(opt_processing)
                ret['success'] = opt_processing.get('success')
                ret['resultObj'] = opt_processing.get('resultObj')
                if ret.get('success') and len(opt_processing.get('resultObj')) > 0:
                    ret['resultObj'] = opt_processing.get('resultObj')[0]
                else:
                    ret['resultObj'] = None
            else:
                history = ori_nova_client.optimization.get_optimization_history_by_id(id)
                import json
                history = json.loads(history)
                ret['success'] = history.get('success')
                ret['resultObj'] = history.get('resultObj')
        except Exception as e:
            ret['success'] = False
            ret['resultObj'] = e.message
        return ret

@urls.register
class OptimazitionStrategies(generic.View):
    url_regex = r'optimizations/strategies/$'

    @rest_utils.ajax(authenticated=True, data_required=False)
    def get(self, request):
        ret = dict()
        try:
            ori_nova_client = optimizeclient(request)
            #new_client = OptimizationsManager(ori_nova_client)
            algors = ori_nova_client.optimization.get_optimization_algorithms()
            import json
            algors = json.loads(algors)
            ret['success'] = algors.get('success')
            ret['resultObj'] = algors.get('resultObj')
        except Exception as e:
            ret['success'] = False
            ret['resultObj'] = e.message
        return ret

    @rest_utils.ajax(authenticated=True, data_required=True)
    def post(self, request):
        ret = dict()
        try:
            ori_nova_client = optimizeclient(request)
            #new_client = OptimizationsManager(ori_nova_client)
            algors = ori_nova_client.optimization.algorithm_create(request.DATA)
            import json
            algors = json.loads(algors)
            ret['success'] = algors.get('success')
            ret['resultObj'] = algors.get('resultObj')
        except Exception as e:
            ret['success'] = False
            ret['resultObj'] = e.message
        return ret

@urls.register
class Optimizations(generic.View):
    url_regex = r'optimizations$'

    @rest_utils.ajax(authenticated=True, data_required=False)
    def get(self, request):
        ret = dict()
        try:
            ori_nova_client = optimizeclient(request)
            #new_client = OptimizationsManager(ori_nova_client)
            res = ori_nova_client.optimization.get_optimization_history()
            import json
            res = json.loads(res)
            ret['success'] = res.get('success')
            ret['resultObj'] = res.get('resultObj')
        except Exception as e:
            ret['success'] = False
            ret['resultObj'] = e.message
        return ret

    @rest_utils.ajax(authenticated=True, data_required=False)
    def post(self, request):
        ret = dict()
        try:
            ori_nova_client = optimizeclient(request)
            #new_client = OptimizationsManager(ori_nova_client)
            res = ori_nova_client.optimization.do_optimize(request.DATA['algorithm_id'], int(request.DATA['cluster_id']))
            import json
            res = json.loads(res)
            ret['success'] = res.get('success')
            ret['resultObj'] = res.get('resultObj')
        except Exception as e:
            ret['success'] = False
            ret['resultObj'] = e.message
        return ret

@urls.register
class Optimizations_preview(generic.View):
    url_regex = r'optimizations-preview$'

    @rest_utils.ajax(authenticated=True, data_required=False)
    def post(self, request):
        ret = dict()
        try:
            ori_nova_client = optimizeclient(request)
            #new_client = OptimizationsManager(ori_nova_client)
            res = ori_nova_client.optimization.do_action(request.DATA['preview'], int(request.DATA['cluster_id']))
            import json
            res = json.loads(res)
            ret['success'] = res.get('success')
            ret['resultObj'] = res.get('resultObj')
        except Exception as e:
            ret['success'] = False
            ret['resultObj'] = e.message
        return ret


@urls.register
class Optimizations_action(generic.View):
    url_regex = r'optimizations/action$'

    @rest_utils.ajax(authenticated=True, data_required=False)
    def post(self, request):
        ret = dict()
        try:
            ori_nova_client = optimizeclient(request)
            #new_client = OptimizationsManager(ori_nova_client)
            res = ori_nova_client.optimization.do_action(request.DATA)
            import json
            res = json.loads(res)
            ret['success'] = res.get('success')
            ret['resultObj'] = res.get('resultObj')
        except Exception as e:
            ret['success'] = False
            ret['resultObj'] = e.message
        return ret

@urls.register
class ClustersLayouts(generic.View):
    url_regex = r'optimizations/clusters/$'

    @rest_utils.ajax(authenticated=False, data_required=False)
    def get(self, request):
        ret = dict()
        try:
            optimize_client = optimizeclient(request)
            layouts = optimize_client.vm_host_layout.list_vm_host_layouts()
            import json
            layouts = json.loads(layouts)

            ret['success'] = True
            ret['resultObj'] = layouts.get('resultObj')
        except Exception as e:
            ret['success'] = False
            ret['resultObj'] = e.message
        return ret

@urls.register
class UpdateClusterStrategy(generic.View):
    url_regex = r'optimizations/clusters/(?P<cluster_id>.+|default)/strategy/(?P<strategy_id>.+|default)/update/$'

    @rest_utils.ajax(authenticated=False, data_required=False)
    def post(self, request, cluster_id, strategy_id):
        ret = dict()
        try:
            optimize_client = optimizeclient(request)
            is_remove = False
            if request.DATA['remove'] == 'true':
                is_remove = True
            layouts = optimize_client.optimization.update_optimization_algorithm(strategy_id, int(cluster_id), remove=is_remove)
            import json
            layouts = json.loads(layouts)

            ret['success'] = True
            ret['resultObj'] = layouts.get('resultObj')
        except Exception as e:
            ret['success'] = False
            ret['resultObj'] = e.message
        return ret
