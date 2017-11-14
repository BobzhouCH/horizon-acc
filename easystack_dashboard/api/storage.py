""" Storage Mgmt
"""

import logging
from cephmgmtclient import client as storage_client
from django.conf import settings
from horizon.utils.memoized import memoized  # noqa

from easystack_dashboard.api import base

LOG = logging.getLogger(__name__)

@memoized
def cephmngtclient(request):
    """Initialization of dcmgmt client."""

    insecure = getattr(settings, 'OPENSTACK_SSL_NO_VERIFY', False)
    cacert = getattr(settings, 'OPENSTACK_SSL_CACERT', None)
    return storage_client.get_client('1',
                                     log_user="haha",
                                    token=(lambda: request.user.token.id),
                                    insecure=insecure,
                                    cacert=cacert)

def clusters_list(request):
    return cephmngtclient(request).cephstorage.get_clusters()

def clusters_edit(request, cluster_id, **kargs):
    return cephmngtclient(request).cephstorage.modify_cluster(cluster_id, **kargs)

def clusters_delete(request, cluster_id):
    return cephmngtclient(request).cephstorage.delete_cluster(cluster_id)

def cluster_add(request, **new_cluster):
    return cephmngtclient(request).cephstorage.add_cluster(**new_cluster)

def cluster_get(request, cluster_id):
    return cephmngtclient(request).cephstorage.get_clusterinfo(cluster_id)

def cluster_action(request, cluster_id, operation):
    return cephmngtclient(request).cephstorage.manipulate_cluster(cluster_id, operation)

def server_add(request, cluster_id, **new_server):
    return cephmngtclient(request).cephstorage.add_server(cluster_id, **new_server)

def job_search_http(request, job_id):
    return cephmngtclient(request).cephstorage.get_job(job_id)

def deploy(request, cluster_id):
    return cephmngtclient(request).cephstorage.manipulate_cluster(cluster_id, operation='deploy')

def expand(request, cluster_id):
    return cephmngtclient(request).cephstorage.manipulate_cluster(cluster_id, operation='expand')

def servers_list(request, cluster_id, **args):
     return cephmngtclient(request).cephstorage.get_servers(cluster_id, **args)

def servers_down(request, cluster_id):
    return cephmngtclient(request).cephstorage.get_hosts_number(cluster_id)

def server_restart(request, cluster_id, server_id):
    return cephmngtclient(request).cephstorage.manipulate_server(cluster_id, server_id, operation="restart")

def server_delete(request, cluster_id, server_id):
    return cephmngtclient(request).cephstorage.delete_server(cluster_id, server_id)

def networks_list(request, cluster_id, server_id):
    return cephmngtclient(request).cephstorage.get_networks(cluster_id, server_id)

def iohistory_get(request, type_id, item_type, **kwargs):
    if (item_type == 'net'):
        name = kwargs.pop('name', '')
    if kwargs is None:
        kwargs = {}
    if (item_type == 'net'):
        sts = cephmngtclient(request).cephstorage.get_history(type_id, item_type, item_name = name, **kwargs)
    else:
        sts = cephmngtclient(request).cephstorage.get_history(type_id, item_type,  **kwargs)
    return sts


def osd_list(request, cluster_id, server_id):
    return cephmngtclient(request).cephstorage.get_osds(cluster_id, server_id)

def io_list(request, cluster_id, server_id):
    return cephmngtclient(request).cephstorage.get_osds_capacity(cluster_id, server_id)

def history_chart(request, server_id, item_type, **kwargs):
    item_name = kwargs.pop('item_name', '')
    sts = cephmngtclient(request).cephstorage.get_history(server_id, item_type, item_name, **kwargs)
    return sts

def disks_list(request, cluster_id, server_id, osd_id):
    return cephmngtclient(request).cephstorage.get_disk_list(cluster_id,server_id,osd_id)

def osd_delete(request, cluster_id, server_id, osd_id):
    return cephmngtclient(request).cephstorage.delete_osd(cluster_id, server_id, osd_id)

def osd_start(request, cluster_id, server_id, osd_id):
    return cephmngtclient(request).cephstorage.manipulate_osd(cluster_id, server_id, osd_id, operation='start')

def osd_stop(request, cluster_id, server_id, osd_id):
    return cephmngtclient(request).cephstorage.manipulate_osd(cluster_id, server_id, osd_id, operation='stop')

def osd_add(request, cluster_id, server_id, disks):
    return cephmngtclient(request).cephstorage.add_osd(cluster_id, server_id, disks)

def disks_avail(request, cluster_id, server_id):
    return cephmngtclient(request).cephstorage.get_avail_disks(cluster_id, server_id)

def mons_list(request, cluster_id):
    return cephmngtclient(request).cephstorage.get_cluster_monitors(cluster_id)

def mon_add(request, cluster_id, server_id):
    return cephmngtclient(request).cephstorage.add_mon(cluster_id, server_id)

def mon_delete(request, cluster_id, server_id, mon_id):
    return cephmngtclient(request).cephstorage.del_monitor(cluster_id, server_id, mon_id)

def mon_start(request, cluster_id, server_id, mon_id):
    return cephmngtclient(request).cephstorage.manipulate_monitor(cluster_id, server_id, mon_id, operation='start')

def mon_stop(request, cluster_id, server_id, mon_id):
    return cephmngtclient(request).cephstorage.manipulate_monitor(cluster_id, server_id, mon_id, operation='stop')

def mdses_list(request, cluster_id):
    return cephmngtclient(request).cephstorage.get_mdses(cluster_id)

def mds_add(request, cluster_id, server_id):
    return cephmngtclient(request).cephstorage.add_mds(cluster_id, server_id)

def mds_delete(request, cluster_id, server_id, mds_id):
    return cephmngtclient(request).cephstorage.delete_mds(cluster_id, server_id, mds_id)

def mds_start(request, cluster_id, server_id, mon_id):
    return cephmngtclient(request).cephstorage.manipulate_mds(cluster_id, server_id, mon_id, operation='start')

def mds_stop(request, cluster_id, server_id, mon_id):
    return cephmngtclient(request).cephstorage.manipulate_mds(cluster_id, server_id, mon_id, operation='stop')

def cluster_conf_get(request, cluster_id):
    return cephmngtclient(request).cephstorage.get_cluster_conf(cluster_id)

def cluster_conf_update(request, cluster_id, **kwargs):
    return cephmngtclient(request).cephstorage.modify_cluster_conf(cluster_id, **kwargs)

def pools_list(request, cluster_id):
    return cephmngtclient(request).cephstorage.get_pools(cluster_id)

def pool_create(request, cluster_id, **kwargs):
    return cephmngtclient(request).cephstorage.add_pool(cluster_id, **kwargs)

def pool_edit(request, cluster_id, pool_id, **kwargs):
    return cephmngtclient(request).cephstorage.modify_pool(cluster_id, pool_id, **kwargs)

def pools_delete(request, cluster_id, pool_id):
    print 'delete pool api start-----'
    return cephmngtclient(request).cephstorage.del_pool(cluster_id, pool_id)

def rbds_list(request, cluster_id, pool_id):
    return cephmngtclient(request).cephstorage.get_rbds(cluster_id, pool_id)

def rbd_create(request, cluster_id, pool_id, **kwargs):
    return cephmngtclient(request).cephstorage.create_rbd(cluster_id, pool_id, **kwargs)

def rbd_edit(request, cluster_id, pool_id, rbd_id, **kwargs):
    return cephmngtclient(request).cephstorage.modify_rbd(cluster_id, pool_id, rbd_id, **kwargs)

def rbds_delete(request, cluster_id, pool_id, rbd_id):
    LOG.info('wjx rbds_delete api start')
    LOG.info('rbds_delete resposne----%s' %cephmngtclient(request).cephstorage.delete_rbd(cluster_id, pool_id, rbd_id))
    return cephmngtclient(request).cephstorage.delete_rbd(cluster_id, pool_id, rbd_id)

def rbdSnapshots_list(request, cluster_id, pool_id, rbd_id):
    return cephmngtclient(request).cephstorage.get_snapshots(cluster_id, pool_id, rbd_id)

def rbdSnapshot_create(request, cluster_id, pool_id, rbd_id, name):
    print 'create rbd api start-----'
    return cephmngtclient(request).cephstorage.create_snapshot(cluster_id, pool_id, rbd_id, name)

def rbdSnapshot_delete(request, cluster_id, pool_id, rbd_id, snapshot_id):
    print 'delete rbd api start-----'
    return cephmngtclient(request).cephstorage.delete_snapshot(cluster_id, pool_id, rbd_id, snapshot_id)


def group_list(request, cluster_id):
    return cephmngtclient(request).cephstorage.get_groups(cluster_id)

def group_create(request, cluster_id, **kwargs):
    return cephmngtclient(request).cephstorage.add_group(cluster_id, **kwargs)

def group_edit(request, cluster_id, group_id, **kwargs):
    return cephmngtclient(request).cephstorage.modify_group(cluster_id, group_id, **kwargs)

def group_delete(request, cluster_id, group_id):
    return cephmngtclient(request).cephstorage.del_group(cluster_id, group_id)

def folder_list(request, cluster_id):
    return cephmngtclient(request).cephstorage.get_folders(cluster_id)

def folder_create(request, cluster_id, **kwargs):
    return cephmngtclient(request).cephstorage.add_folder(cluster_id, **kwargs)

def folder_edit(request, cluster_id, folder_id, **kwargs):
    return cephmngtclient(request).cephstorage.modify_group(cluster_id, folder_id, **kwargs)

def folder_delete(request, cluster_id, folder_id):
    return cephmngtclient(request).cephstorage.del_folder(cluster_id, folder_id)

def zabbix_status(request, cluster_id):
    return cephmngtclient(request).cephstorage.get_zabbix_status(cluster_id)


def disk_get(request, cluster_id, disk_id):
    return cephmngtclient(request).cephstorage.get_disks(cluster_id,disk_id)