""" Storage Mgmt
"""
from django.utils import http as utils_http
from django.views import generic

from easystack_dashboard import api
import urls
from easystack_dashboard.api.rest import utils as rest_utils

import logging
LOG = logging.getLogger(__name__)

def _response(success, resp = None):
    ret = {"success":success}
    if resp is not None:
        ret["data"] = resp
    return ret

@urls.register
class Disks(generic.View):

    url_regex = r'storage/clusters/(?P<cluster_id>.+|default)/servers/(?P<server_id>.+|default)/disks/$'

    @rest_utils.ajax()
    def get(self, request, cluster_id, server_id):
        try:
            rs = api.storage.disk_get(request, cluster_id, server_id)
            return _response(True, [st.to_dict() for st in rs])
        except Exception as e:
            return _response(False, e.message)

@urls.register
class Clusters(generic.View):

    url_regex = r'storage/clusters/$'

    @rest_utils.ajax()
    def get(self, request):
        # return _response(True,[{"status": None, "addr": "VM", "state": 1, "version": "793192d2-4c4b-43ea-8785-45bc3bdcf140", "id": 1, "name": "TEST23"}])
        try:
            sts = api.storage.clusters_list(request)
            return _response(True, [st.to_dict() for st in sts])
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        try:
            cluster = dict(
                name=request.DATA["name"],
                addr=request.DATA["addr"]
            )
            sts = api.storage.cluster_add(request, **cluster).to_dict()
            return _response(True, sts)
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax()
    def put(self, request):
        try:
            cluster_id = request.DATA["cluster_id"]
            cluster = dict(
                name=request.DATA["name"],
                addr=request.DATA["addr"]
            )
            rs = api.storage.clusters_edit(request, cluster_id, **cluster)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)


    @rest_utils.ajax()
    def delete(self, request):
        try:
            cluster_id=request.GET["cluster_id"]
            sts = api.storage.clusters_delete(request, cluster_id)
            return _response(True, sts)
        except Exception as e:
            return _response(False, e.message)

@urls.register
class Cluster(generic.View):

    url_regex = r'storage/cluster/(?P<cluster_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, cluster_id):
        # return _response(True,{"status": 1, "rawTotal": 644234608640, "poolActive": 4, "serverActive": 4, "deleteRatio": 23, "poolTotal": 4, "monTotal": 3, "rawUsed": 263519711232, "iopsRead": 0, "bandwidth": 1433, "osdTotal": 5, "monActive": 3, "dataUsed": 1024, "statusInfo": "too many PGs per OSD (573 > max 300)", "serversTotal": 4, "dataTotal": 1362305024, "iopsWrite": 0, "rbdNum": 3, "osdActive": 5})
        try:
            cluster = api.storage.cluster_get(request, cluster_id).to_dict()
            return _response(True, cluster)
        except Exception as e:
            return _response(False, e.message)

@urls.register
class ClusterStart(generic.View):

    url_regex = r'storage/clusters/(?P<cluster_id>.+|default)/start$'

    @rest_utils.ajax()
    def patch(self, request, cluster_id):
        try:
            cluster = api.storage.cluster_action(request, cluster_id, operation='start').to_dict()
            return _response(True, cluster)
        except Exception as e:
            return _response(False, e.message)

@urls.register
class ClusterStop(generic.View):

    url_regex = r'storage/clusters/(?P<cluster_id>.+|default)/stop$'

    @rest_utils.ajax()
    def patch(self, request, cluster_id):
        try:
            cluster = api.storage.cluster_action(request, cluster_id, operation='shutdown').to_dict()
            return _response(True, cluster)
        except Exception as e:
            return _response(False, e.message)

@urls.register
class ClusterConf(generic.View):

    url_regex = r'storage/cluster_conf/(?P<cluster_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, cluster_id):
        try:
            cluster_conf = api.storage.cluster_conf_get(request, cluster_id).to_dict()
            return _response(True, cluster_conf)
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, cluster_id):
        try:
            cluster_conf = api.storage.cluster_conf_update(request, cluster_id, **request.DATA)
            return _response(True, cluster_conf.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class ServerAdd(generic.View):

    url_regex = r'storage/add_server$'

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        try:
            server = dict(
                username=request.DATA["username"],
                servername=request.DATA["servername"],
                publicip=request.DATA["publicip"],
                clusterip=request.DATA["clusterip"],
                passwd=request.DATA["passwd"],
            )
            cluster_id = request.DATA["cluster_id"]
            rs = api.storage.server_add(request, cluster_id, **server)
            #job_id = rs.id
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class Jobs(generic.View):

    url_regex = r'storage/job_search$'

    @rest_utils.ajax()
    def get(self, request):
        try:
            job_id = request.GET["job_id"]
            rs = api.storage.job_search_http(request, job_id)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)


@urls.register
class Deploy(generic.View):

    url_regex = r'storage/deploy/cluster/(?P<cluster_id>.+|default)$'

    @rest_utils.ajax()
    def patch(self, request, cluster_id):
        try:
            rs = api.storage.deploy(request, cluster_id)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class Expand(generic.View):

    url_regex = r'storage/expand/cluster/(?P<cluster_id>.+|default)$'

    @rest_utils.ajax()
    def patch(self, request, cluster_id):
        try:
            rs = api.storage.expand(request, cluster_id)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)


@urls.register
class Servers(generic.View):

    url_regex = r'storage/servers$'

    @rest_utils.ajax()
    def get(self, request):
        # return _response(True,[{"username": "root", "status": 1, "passwd": "lenovo", "servername": "host-192-168-121-32", "clusterid": 1, "cpuUsage": 17.34, "publicip": "192.168.121.32", "state": 3, "mons": [{"state": "active", "role": "leader", "name": "a"}], "clusterip": "192.168.121.32", "mds": [], "ramUsage": 20.36, "id": 1}, {"username": "root", "status": 1, "passwd": "lenovo", "servername": "host-192-168-121-31", "clusterid": 1, "cpuUsage": 17.54, "publicip": "192.168.121.31", "state": 3, "mons": [{"state": "active", "role": "follwer", "name": "b"}], "clusterip": "192.168.121.31", "mds": [], "ramUsage": 21.9, "id": 2}, {"username": "root", "status": 1, "passwd": "lenovo", "servername": "host-192-168-121-30", "clusterid": 1, "cpuUsage": 15.68, "publicip": "192.168.121.30", "state": 3, "mons": [{"state": "active", "role": "follwer", "name": "c"}], "clusterip": "192.168.121.30", "mds": [], "ramUsage": 20.73, "id": 3}])
        try:
            cluster_id = request.GET["cluster_id"]
            args = dict(
                marker=request.GET["marker"],
                pagesize=request.GET["pagesize"],
            )
            rs = api.storage.servers_list(request, cluster_id, **args)
            return _response(True, [st.to_dict() for st in rs])
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax(data_required=True)
    def put(self, request):
        try:
            cluster_id = request.DATA["cluster_id"]
            server_id = request.DATA["server_id"]
            rs = api.storage.server_restart(request, cluster_id, server_id)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax()
    def delete(self, request):
        try:
            cluster_id = request.GET["cluster_id"]
            server_id = request.GET["server_id"]
            rs = api.storage.server_delete(request, cluster_id, server_id)
            return _response(True, rs)
        except Exception as e:
            return _response(False, e.message)

@urls.register
class Networks(generic.View):

    url_regex = r'storage/clusters/(?P<cluster_id>.+|default)/servers/(?P<server_id>.+|default)/networks$'

    @rest_utils.ajax()
    def get(self, request, cluster_id, server_id):
        try:
            rs = api.storage.networks_list(request, cluster_id, server_id)
            return _response(True, [st.to_dict() for st in rs])
        except Exception as e:
            return _response(False, e.message)

@urls.register
class Network(generic.View):

    url_regex = r'storage/networkhistory/(?P<server_id>.+|default)/(?P<item_type>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, server_id, item_type):
        try:
            kwargs = dict(
               time_from= request.GET["time_from"],
               time_till= request.GET["time_till"],
               name = request.GET["name"]
            )
            rs = api.storage.iohistory_get(request, server_id, item_type ,  **kwargs)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class IoHistory(generic.View):

    url_regex = r'storage/iohistory/(?P<cluster_id>.+|default)/(?P<item_type>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, cluster_id, item_type):
        try:
            kwargs = dict(
               time_from= request.GET["time_from"],
               time_till= request.GET["time_till"],
            )
            rs = api.storage.iohistory_get(request, cluster_id, item_type, **kwargs)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class Osds(generic.View):

    url_regex = r'storage/clusters/(?P<cluster_id>.+|default)/servers/(?P<server_id>.+|default)/osds/$'

    @rest_utils.ajax()
    def get(self, request, cluster_id, server_id):
        # if cluster_id==1:
        #     return _response(True,[{"osdId": 7, "osdName": "osd.0", "osdStatus": "up"}])
        # if cluster_id==2:
        #     return _response(True,[{"osdId": 8, "osdName": "osd.1", "osdStatus": "up"}, {"osdId": 9, "osdName": "osd.2", "osdStatus": "up"}])
        # if cluster_id == 2:
        #     return _response(True, [{"osdId": 12, "osdName": "osd.3", "osdStatus": "up"}])
        try:
            rs = api.storage.osd_list(request, cluster_id, server_id)
            return _response(True, [st.to_dict() for st in rs])
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax()
    def post(self, request, cluster_id, server_id):
        try:
            rs = api.storage.osd_add(request, cluster_id, server_id, request.DATA["disks"])
            return _response(True, rs)
        except Exception as e:
            return _response(False, e.message)

@urls.register
class IO(generic.View):

    url_regex = r'storage/clusters/(?P<cluster_id>.+|default)/servers/(?P<server_id>.+|default)/osds_capacity/$'

    @rest_utils.ajax()
    def get(self, request, cluster_id, server_id):
        try:
            rs = api.storage.io_list(request, cluster_id, server_id)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class History(generic.View):

    url_regex = r'storage/history/servers/(?P<server_id>.+|default)/item/(?P<item_type>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, server_id, item_type):
        try:
            kwargs = dict(
                time_from=request.GET["time_from"],
                time_till=request.GET["time_till"],
                item_name=request.GET["item_name"],
            )
            rs = api.storage.history_chart(request, server_id, item_type,  **kwargs)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class Disks(generic.View):

    url_regex = r'storage/clusters/(?P<cluster_id>.+|default)/servers/(?P<server_id>.+|default)/osds/(?P<osd_id>.+|default)/disks/$'

    @rest_utils.ajax()
    def get(self, request, cluster_id, server_id, osd_id):
        try:
            rs = api.storage.disks_list(request, cluster_id, server_id, osd_id)
            return _response(True, [st.to_dict() for st in rs])
        except Exception as e:
            return _response(False, e.message)

@urls.register
class OsdAction(generic.View):

    url_regex = r'storage/clusters/(?P<cluster_id>.+|default)/servers/(?P<server_id>.+|default)/osds/(?P<osd_id>.+|default)/action$'

    @rest_utils.ajax()
    def delete(self, request, cluster_id, server_id, osd_id):
        try:
            rs = api.storage.osd_delete(request, cluster_id, server_id, osd_id)
            return _response(True, rs)
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax()
    def patch(self, request, cluster_id, server_id, osd_id):
        try:
            rs = api.storage.osd_stop(request, cluster_id, server_id, osd_id)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class OsdStart(generic.View):

    url_regex = r'storage/clusters/(?P<cluster_id>.+|default)/servers/(?P<server_id>.+|default)/osds/(?P<osd_id>.+|default)/osdStart$'

    @rest_utils.ajax(data_required=True)
    def patch(self, request, cluster_id, server_id, osd_id):
        try:
            rs = api.storage.osd_start(request, cluster_id, server_id, osd_id)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class OsdAddAvailDisks(generic.View):

    url_regex = r'storage/availdisks$'

    @rest_utils.ajax()
    def get(self, request):
        try:
            cluster_id = request.GET["cluster_id"]
            server_id = request.GET["server_id"]
            # data = [
            #     {
            #         "name":"ssd",
            #         "uuid":"1",
            #         "capability": 1000000000,
            #         "type": 0
            #     }
            # ]
            #return _response(True, [st for st in data])
            rs = api.storage.disks_avail(request, cluster_id, server_id)
            return _response(True, [st.to_dict() for st in rs])
        except Exception as e:
            return _response(False, e.message)

@urls.register
class MonAction(generic.View):

    url_regex = r'storage/mons/action$'

    @rest_utils.ajax()
    def get(self, request):
        try:
            cluster_id = request.GET["cluster_id"]
            rs = api.storage.mons_list(request, int(cluster_id))
            return _response(True, [st.to_dict() for st in rs])
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax()
    def post(self, request):
        try:
            cluster_id = request.DATA["cluster_id"]
            server_id = request.DATA["server_id"]
            rs = api.storage.mon_add(request, cluster_id, server_id)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax()
    def put(self, request):
        try:
            cluster_id = request.DATA["cluster_id"]
            server_id = request.DATA["server_id"]
            mon_id = request.DATA["mon_id"]
            rs = api.storage.mon_delete(request, cluster_id, server_id, mon_id)
            return _response(True, rs)
        except Exception as e:
            return _response(False, e.message)

@urls.register
class MonStart(generic.View):

    url_regex = r'storage/mon/start'

    @rest_utils.ajax()
    def put(self, request):
        try:
            cluster_id = request.DATA["cluster_id"]
            server_id = request.DATA["server_id"]
            mon_id = request.DATA["mon_id"]
            rs = api.storage.mon_start(request, cluster_id, server_id, mon_id)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class MonStop(generic.View):

    url_regex = r'storage/mon/stop'

    @rest_utils.ajax()
    def put(self, request):
        try:
            cluster_id = request.DATA["cluster_id"]
            server_id = request.DATA["server_id"]
            mon_id = request.DATA["mon_id"]
            rs = api.storage.mon_stop(request, cluster_id, server_id, mon_id)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class MDSAction(generic.View):

    url_regex = r'storage/mds/action$'

    @rest_utils.ajax()
    def get(self, request):
        try:
            cluster_id = request.GET["cluster_id"]
            rs = api.storage.mdses_list(request, int(cluster_id))
            return _response(True, [st.to_dict() for st in rs])
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax()
    def post(self, request):
        try:
            cluster_id = request.DATA["cluster_id"]
            server_id = request.DATA["server_id"]
            rs = api.storage.mds_add(request, cluster_id, server_id)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax()
    def put(self, request):
        try:
            cluster_id = request.DATA["cluster_id"]
            mds_id = request.DATA["mds_id"]
            rs = api.storage.mds_delete(request, cluster_id, mds_id)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class MdsStart(generic.View):

    url_regex = r'storage/mds/start'

    @rest_utils.ajax()
    def put(self, request):
        try:
            cluster_id = request.DATA["cluster_id"]
            server_id = request.DATA["server_id"]
            mon_id = request.DATA["mon_id"]
            rs = api.storage.mds_start(request, cluster_id, server_id, mon_id)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class MdsStop(generic.View):

    url_regex = r'storage/mds/stop'

    @rest_utils.ajax()
    def put(self, request):
        try:
            cluster_id = request.DATA["cluster_id"]
            server_id = request.DATA["server_id"]
            mon_id = request.DATA["mon_id"]
            rs = api.storage.mds_stop(request, cluster_id, server_id, mon_id)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class Pools(generic.View):

    url_regex = r'storage/clusters/(?P<cluster_id>.+|default)/pools$'

    @rest_utils.ajax()
    def get(self, request, cluster_id):
        try:
            rs = api.storage.pools_list(request, cluster_id)
            return _response(True, [st.to_dict() for st in rs])
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax()
    def post(self, request, cluster_id):
        try:
            kwargs = dict(
                name=request.DATA["name"],
                pg_num=request.DATA["pg_num"],
                size=request.DATA["size"],
                storage_group_id = 0
            )
            rs = api.storage.pool_create(request, cluster_id, **kwargs)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)


@urls.register
class PoolRbd(generic.View):

    url_regex = r'storage/clusters/(?P<cluster_id>.+|default)/pools/(?P<pool_id>.+|default)/rbds$'

    @rest_utils.ajax()
    def get(self, request, cluster_id, pool_id):
        try:
            rs = api.storage.rbds_list(request, cluster_id, pool_id)
            return _response(True, [st.to_dict() for st in rs])
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax()
    def post(self, request, cluster_id, pool_id):
        try:
            kwargs = dict(
                name=request.DATA["name"],
                capacity=request.DATA["capacity"],
                object_size=request.DATA["object_size"]
            )
            rs = api.storage.rbd_create(request, cluster_id, pool_id, **kwargs)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class rbdSnapshot(generic.View):

    url_regex = r'storage/clusters/(?P<cluster_id>.+|default)/pools/(?P<pool_id>.+|default)/rbds/(?P<rbd_id>.+|default)/snapshots$'

    @rest_utils.ajax()
    def get(self, request, cluster_id, pool_id, rbd_id):
        try:
            rs = api.storage.rbdSnapshots_list(request, int(cluster_id), int(pool_id), int(rbd_id))
            return _response(True, [st.to_dict() for st in rs])
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax()
    def post(self, request, cluster_id, pool_id, rbd_id):
        try:
            name=request.DATA["name"]
            rs = api.storage.rbdSnapshot_create(request, int(cluster_id), int(pool_id), int(rbd_id), name)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax()
    def delete(self, request, cluster_id, pool_id, rbd_id):
        try:
            #snapshot_id = request.DATA["snapshot_id"]
            snapshot_id = request.GET["snapshot_id"]
            rs = api.storage.rbdSnapshot_delete(request, int(cluster_id), int(pool_id), int(rbd_id), int(snapshot_id))
            return _response(True, rs)
        except Exception as e:
            return _response(False, e.message)

@urls.register
class rbdList(generic.View):
    url_regex = r'storage/clusters/(?P<cluster_id>.+|default)/pools/(?P<pool_id>.+|default)/rbds/(?P<rbd_id>.+|default)$'
    @rest_utils.ajax()
    def delete(self, request, cluster_id, pool_id, rbd_id):
        try:
            #rbd_id = request.DATA["rbd_id"]
            rs = api.storage.rbds_delete(request, int(cluster_id), int(pool_id), int(rbd_id))
            return _response(True, rs)
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax()
    def put(self, request, cluster_id, pool_id, rbd_id):
        try:
            kwargs = dict(
                name=request.DATA["name"],
                capacity=request.DATA["capacity"],
                object_size=request.DATA["object_size"]
            )
            #rbd_id = request.DATA["rbd_id"]
            rs = api.storage.rbd_edit(request, int(cluster_id), int(pool_id), int(rbd_id), **kwargs)
            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)


@urls.register
class PoolList(generic.View):

    url_regex = r'storage/clusters/(?P<cluster_id>.+|default)/pools/(?P<pool_id>.+|default)$'

    @rest_utils.ajax()
    def put(self, request, cluster_id, pool_id):
        try:
            kwargs = dict(
                 storage_group_id= 0,
                 name=request.DATA["name"],
                 pg_num=request.DATA["pg_num"],
                 dedup_rate=request.DATA["dedup_rate"],
                 deduplication=request.DATA["deduplication"]
            )
      
            rs = api.storage.pool_edit(request, int(cluster_id), int(pool_id), **kwargs)

            return _response(True, rs.to_dict())
        except Exception as e:
            return _response(False, e.message)

    @rest_utils.ajax()
    def delete(self, request, cluster_id, pool_id):
        try:
             # pool_id = request.DATA["pool_id"]
             rs = api.storage.pools_delete(request, int(cluster_id), int(pool_id))
             return _response(True)
        except Exception as e:
             return _response(False, e.message)

@urls.register
class DownHost(generic.View):

    url_regex = r'storage/clusters/(?P<cluster_id>.+|default)/hostDown$'

    @rest_utils.ajax()
    def get(self, request, cluster_id):
        try:
            sts = api.storage.servers_down(request, cluster_id)
            return _response(True, sts.to_dict())
        except Exception as e:
            return _response(False, e.message)

@urls.register
class Zabbix(generic.View):

    url_regex = r'storage/zabbix/status/(?P<cluster_id>.+|default)$'

    @rest_utils.ajax(authenticated=False)
    def get(self,request,cluster_id):
        try:
            sts = api.storage.zabbix_status(request, cluster_id)
            return _response(True,sts.to_dict())

        except Exception as e:
            return _response(False, e.message)
        




