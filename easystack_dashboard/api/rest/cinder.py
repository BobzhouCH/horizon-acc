# Copyright 2015 IBM Corp.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""API over the cinder service.
"""
from collections import OrderedDict
from django.conf import settings
from django.views import generic
from django.utils.datastructures import SortedDict  # noqa
from django.utils.translation import ugettext_lazy as _

from easystack_dashboard import api
from easystack_dashboard.api.rest import utils as rest_utils

from easystack_dashboard.api.rest import urls
from horizon import exceptions
from easystack_dashboard.api import keystone

@urls.register
class Services(generic.View):

    """API for cinder services.
    """
    url_regex = r'cinder/services/$'

    @rest_utils.ajax()
    def get(self, request):
        result = api.cinder.service_list(request)
        return {'items': [e._info for e in result]}


@urls.register
class Volumes(generic.View):

    """API for cinder volumes.
    """
    url_regex = r'cinder/volumes/$'

    def ensure_attachment_server(request, volumes):
        instances, has_more = api.nova.server_list(
            request,
            search_opts=None,
            all_tenants=request.GET.get('all_tenants', False),
        )
        instance_dict = SortedDict([(i.id, i) for i in instances])

        for item in volumes:
            if not item['attachments']:
                continue
            for i, atmt in enumerate(item['attachments']):
                instance = instance_dict.get(atmt.get('server_id'), None)
                if instance:
                    instance_name = {'instance_name': instance.name}
                    item['attachments'][i].update(instance_name)
                    if item.get('name') == '':
                        item.update({'name': instance.name})
        return volumes

    def ensure_volume_snapshots(request, volumes):
        if keystone.is_public_region(request):
            return volumes
        volumes_map = SortedDict([(i['id'], i) for i in volumes])
        snapshot_list = api.cinder.volume_snapshot_list(request)
        for snapshot in snapshot_list:
            if snapshot.volume_id in volumes_map:
                volume = volumes_map[snapshot.volume_id]
                volume.setdefault('snapshots', [])
                volume['snapshots'].append(snapshot.to_dict())

        return volumes

    @rest_utils.ajax()
    @rest_utils.patch_items_by_func(ensure_volume_snapshots)
    @rest_utils.patch_items_by_func(ensure_attachment_server)
    @rest_utils.admin_add_tenant_name(
        all_projects='all_tenants', tenant_col='os-vol-tenant-attr:tenant_id')
    def get(self, request):
        """Get a detailed list of volumes associated with the current user's
        project.

        If invoked as an admin, you may set the GET parameter "all_projects"
        to 'true'.

        The following get parameters may be passed in the GET

        :param search_opts includes options such as name, status, bootable

        The listing result is an object with property "items".
        """
        # TODO(clu_): when v2 pagination stuff in Cinder API merges
        # (https://review.openstack.org/#/c/118450), handle here accordingly

        result = api.cinder.volume_list(
            request,
            search_opts=rest_utils.parse_filters_kwargs(request)[0]
        )
        return {'items': [u.to_dict() for u in result]}

    @rest_utils.ajax(data_required=True)
    def post(self, request):
        new_volume = api.cinder.volume_create(
            request,
            size=request.DATA.get('size'),
            name=request.DATA.get('name'),
            description=request.DATA.get('description'),
            volume_type=request.DATA.get('volume_type'),
            snapshot_id=request.DATA.get('snapshot_id', None),
            multiattach=request.DATA.get('multiattach', False),
            metadata=request.DATA.get('metadata', None),
            image_id=request.DATA.get('image_id', None),
            availability_zone=request.DATA.get('availability_zone', None),
            source_volid=request.DATA.get('source_volid', None),
        )
        return rest_utils.CreatedResponse(
            '/api/cinder/volume/%s' % new_volume.id,
            new_volume.to_dict()
        )

    @rest_utils.ajax(data_required=True)
    def delete(self, request):
        """Delete multiple volumes by id.

        The DELETE data should be an application/json array of volume ids to
        delete.

        This method returns HTTP 204 (no content) on success.
        """
        for volume_id in request.DATA:
            api.cinder.volume_delete(request, volume_id)


@urls.register
class Volume(generic.View):
    url_regex = r'cinder/volume/(?P<volume_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, volume_id):
        return api.cinder.volume_get(request, volume_id).to_dict()

    @rest_utils.ajax(data_required=True)
    def patch(self, request, volume_id):
        volume = api.cinder.volume_update(
            request,
            volume_id,
            name=request.DATA['name'],
            description=request.DATA['description'])

    @rest_utils.ajax()
    def delete(self, request, volume_id):
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        api.cinder.volume_delete(request, volume_id)

    @rest_utils.ajax(data_required=True)
    def post(self, request, volume_id):
        new_size = request.DATA['new_size']
        api.cinder.volume_extend(request, volume_id, new_size)


@urls.register
class VolumeSnapshots(generic.View):

    """API for cinder volume snapshots.
    """
    url_regex = r'cinder/volumesnapshots/$'


    def ensure_number_of_volumes_create_by_snapshot(request, snapshots):
        '''
        Cause: Can't delete the snapshot which has created any volume.
        @author: Chao.Song
        '''
        volumes = api.cinder.volume_list(request, {'all_tenants': 1})

        for s in snapshots:
            createVolumeCount = 0
            for v in volumes:
                if v.to_dict()['snapshot_id'] == s['id']:
                    createVolumeCount = createVolumeCount + 1
            s.update({"numberOfCreateVolume": createVolumeCount})
        return snapshots


    def ensure_tenant_domain_name(request, snapshots_dict):
        try:
            tenants, has_more = api.keystone.tenant_list(request)
            domains = api.keystone.domain_list(request)
        except Exception:
            tenants = []
            domains = []
            return snapshots_dict
        tenant_dict = SortedDict([(t.id, t) for t in tenants])
        domain_dict = SortedDict([(d.id, d) for d in domains])
        for item in snapshots_dict:
            tenant = tenant_dict.get(item['os-extended-snapshot-attributes:project_id'])
            if hasattr(tenant, 'name'):
                item['tenant_name'] = getattr(tenant, 'name', None)
                try:
                    item['domain'] = getattr(domain_dict.get(tenant.domain_id), 'name', None)
                except:
                    pass
        return snapshots_dict


    @rest_utils.ajax()
    @rest_utils.patch_items_by_func(rest_utils.ensure_volume_name_and_type)
    @rest_utils.patch_items_by_func(ensure_number_of_volumes_create_by_snapshot)
    @rest_utils.patch_items_by_func(ensure_tenant_domain_name)
    def get(self, request):
        """Get a detailed list of volume snapshots associated with the current
        user's project.

        The listing result is an object with property "items".
        """
        if keystone.is_public_region(request):
            return {'items':[]}
        result = api.cinder.volume_snapshot_list(
            request,
            search_opts=rest_utils.parse_filters_kwargs(request)[0]
        )

        return {'items': [u.to_dict() for u in result]}


@urls.register
class VolumeSnapshot(generic.View):
    url_regex = r'cinder/volumesnapshot/(?P<volume_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, volume_id):
        return api.cinder.volume_snapshot_get(request, volume_id).to_dict()

    @rest_utils.ajax(data_required=True)
    def patch(self, request, volume_id):
        volume_snapshot = api.cinder.volume_snapshot_update(
            request,
            volume_id,
            name=request.DATA['name'],
            description=request.DATA['description'])

    @rest_utils.ajax()
    def delete(self, request, volume_id):
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        # need check if there is volumes created from this snapshot
        volumes = api.cinder.volume_list(request)

        in_use = False
        for volume in volumes:
            if volume.snapshot_id == volume_id:
                in_use = True
                break

        if in_use:
            msg = _("Unable to delete in use volume snapshot.")
            raise exceptions.Conflict(msg)
        api.cinder.volume_snapshot_delete(request, volume_id)

    @rest_utils.ajax(data_required=True)
    def post(self, request, volume_id):
        new_volume_snapshot = api.cinder.volume_snapshot_create(
            request,
            volume_id=volume_id,
            name=request.DATA.get('name'),
            description=request.DATA.get('description', None),
            force=request.DATA.get('force', False),
        )
        return rest_utils.CreatedResponse(
            '/api/cinder/volumesnapshot/%s' % new_volume_snapshot.id,
            new_volume_snapshot.to_dict()
        )


@urls.register
class VolumeSnapshotState(generic.View):

    """API for reset volumesnapshot state
    """
    url_regex = r'cinder/volumesnapshots/(?P<snapshot_id>.+|default)/resetstate/$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, snapshot_id):
        return api.cinder.volume_snapshot_reset_state(
            request,
            snapshot_id,
            request.DATA.get('state')
        )


@urls.register
class VolumeState(generic.View):

    """API for reset volume state
    """
    url_regex = r'cinder/volumes/(?P<volume_id>.+|default)/resetstate/$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, volume_id):
        return api.cinder.volume_reset_state(
            request,
            volume_id,
            request.DATA.get('state')
        )


@urls.register
class VolumeBackups(generic.View):

    """API for cinder volume snapshots.
    """
    url_regex = r'cinder/volumebackups/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a detailed list of volume snapshots associated with the current
        user's project.

        The listing result is an object with property "items".
        """

        result = api.cinder.volume_backup_list(
              request
        )
        rest_utils.ensure_volume_name(request, result)
        return {'items': [u.to_dict() for u in result]}


@urls.register
class VolumeBackup(generic.View):
    url_regex = r'cinder/volumebackup/(?P<volume_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, volume_id):
        if volume_id:
            result = api.cinder.volume_backup_list(
                request, search_opts={'volume_id': volume_id}
            )
            rest_utils.ensure_volume_name(request, result)
            return {'items': [u.to_dict() for u in result]}


    @rest_utils.ajax()
    def delete(self, request, volume_id):
        if id == 'default':
            raise django.http.HttpResponseNotFound('default')
        api.cinder.volume_backup_delete(request, volume_id)

    @rest_utils.ajax(data_required=True)
    def post(self, request, volume_id):
        keys = tuple(request.DATA)
        if 'backup_id' and 'volume_id' in keys:
            if request.DATA['volume_id'] == 'Choose No':
                restore = api.cinder.volume_backup_restore_default(
                    request,
                    backup_id=request.DATA['backup_id'],
                )
            else:
                restore = api.cinder.volume_backup_restore(
                    request,
                    volume_id=request.DATA['volume_id'],
                    backup_id=request.DATA['backup_id'],
                )

            result_dict = {'backup_id' : restore.backup_id,
                'volume_id' : restore.volume_id,
                'volume_name' : restore.volume_name
            }
            return {'items': result_dict}
        else:
            if(request.DATA['backup_type']==u'full'):
                increment = False
                new_backup = api.cinder.volume_backup_create(
                    request,
                    volume_id=request.DATA['volume']['id'],
                    name=request.DATA.get('name'),
                    incremental=increment,
                    description=request.DATA.get('description', None),
                )
                return rest_utils.CreatedResponse(
                    '/api/cinder/volumebackup/%s' % new_backup.id,
                    new_backup.to_dict()
                )
            else:
                increment = True
                new_backup = api.cinder.volume_backup_incre_create(
                    request,
                    volume_id=request.DATA['volume']['id'],
                    name=request.DATA.get('name'),
                    incremental=increment,
                    description=request.DATA.get('description', None),
                )
                return rest_utils.CreatedResponse(
                    '/api/cinder/volumebackup/%s' % new_backup.id,
                    new_backup.to_dict()
                )

@urls.register
class SingleVolumeBackup(generic.View):
    url_regex = r'cinder/singlevolumebackup/(?P<backup_id>[^/]+)/$'

    @rest_utils.ajax()
    def get(self, request, backup_id):
        if backup_id:
            result = api.cinder.volume_backup_get(request, backup_id)
            rest_utils.ensure_volume_name(request, [result])
            return {'items': result.to_dict()}


@urls.register
class TenantAbsoluteLimits(generic.View):
    url_regex = r'cinder/tenantabsolutelimits/$'

    @rest_utils.ajax()
    def get(self, request):
        return api.cinder.tenant_absolute_limits(request).to_dict()


@urls.register
class VolumeTypes(generic.View):
    url_regex = r'cinder/volumetypes/$'

    @rest_utils.ajax()
    def get(self, request):
        def _filter_domain(type_list):
            ''':volume_type_name: "DISPLAY_NAME:DOMAIN_ID"'''
            filtered_types = []
            if api.keystone.is_dedicated_context(request):
                self_domain_id = api.keystone.get_default_domain(request).id
            else:
                self_domain_id = ''
            for t in type_list:
                names = t.name.split(':', 1)
                if len(names) == 1:
                    names.append('')
                type_name, domain_id = tuple(names)
                if domain_id == self_domain_id:
                    filtered_types.append({'id': t.id, 'name': type_name})
            return filtered_types

        def _filter_name(type_list):
            '''if the user is not cloud admin, hide the specified types'''
            shield_type = getattr(settings, "SHIELD_VOLUME_TYPE", None)
            # ignore if not set
            if shield_type is None:
                return type_list
            cloud_admin = api.keystone.is_cloud_admin(request)
            _can_show = lambda t: cloud_admin or shield_type not in t['name']
            return [t for t in type_list if _can_show(t)]

        type_list = api.cinder.volume_type_list(request)
        return {'items': _filter_name(_filter_domain(type_list))}


@urls.register
class AdminVolumeTypes(generic.View):
    url_regex = r'cinder/adminvolumetypes/$'

    @rest_utils.ajax()
    def get(self, request):

        def _ensure_volume_types(volume_types):
            result = []
            tmp = []
            for u in volume_types:
                u['extraspecs'] = []
                for key,value in u['extra_specs'].iteritems():
                    u['extraspecs'].append({'id': key, 'key': key,'value': value})
                result.append(u)
            return result
        try:
            volume_types = \
                api.cinder.volume_type_list_with_qos_associations(self.request)
        except Exception:
            volume_types = []
            exceptions.handle(self.request,
                              _("Unable to retrieve volume types"))

        # Gather volume type encryption information
        try:
            vol_type_enc_list = api.cinder.volume_encryption_type_list(
                self.request)
        except Exception:
            vol_type_enc_list = []
            msg = _('Unable to retrieve volume type encryption information.')
            exceptions.handle(self.request, msg)

        vol_type_enc_dict = OrderedDict([(e.volume_type_id, e) for e in
                                         vol_type_enc_list])
        for volume_type in volume_types:
            vol_type_enc = vol_type_enc_dict.get(volume_type.id, None)
            if vol_type_enc is not None:
                volume_type.encryption = vol_type_enc.provider
                # volume_type.encryption.name = volume_type.name
            else:
                volume_type.encryption = None

        resultList = [api.cinder.AdminVolumeType(u).to_dict() for u in volume_types]

        return {'items': _ensure_volume_types(resultList)}

    @rest_utils.ajax(data_required=True)
    def post(self, request):

        try:
            data = request.DATA

            volume_type = api.cinder.volume_type_create(
                request,
                data['name'],
                data['vol_type_description'],
                bool(data['is_public']))
            return request.DATA

        except Exception:
            exceptions.handle(self.request,
                              _("Unable to create the volume type"))


@urls.register
class AdminVolumeType(generic.View):
    url_regex = r'cinder/adminvolumetypes/(?P<volume_type_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, volume_type_id):
        vol_type = api.cinder.volume_type_get(request, volume_type_id)
        result = api.cinder.AdminVolumeType(vol_type).to_dict()
        return {'items': result}

    @rest_utils.ajax(data_required=True)
    def patch(self, request, volume_type_id):

        try:
            data = request.DATA
            volume_type = api.cinder.volume_type_update(request,
                                                        volume_type_id,
                                                        data['name'],
                                                        data['vol_type_description'],
                                                        bool(data['is_public']))
        except Exception:
            exceptions.handle(self.request,
                              _("Unable to update the volume type"))

    @rest_utils.ajax()
    def delete(self, request, volume_type_id):
        try:
            api.cinder.volume_type_delete(request, volume_type_id)
        except Exception as e:
            raise e


@urls.register
class AssociateVolumeTypeWithQosSpec(generic.View):
    url_regex = r'cinder/associateqosspecs/$'

    @rest_utils.ajax()
    def post(self, request):
        try:
            data = request.DATA

            if('old_qos_spec_id' in data):

                qos_spec = api.cinder.qos_spec_get(request,
                                               data['old_qos_spec_id'])
                api.cinder.qos_spec_disassociate(request,
                                         qos_spec,
                                         data['vol_type_id'])

            if(data['new_qos_spec_id'] != '0'):

                qos_spec = api.cinder.qos_spec_get(request,
                                                   data['new_qos_spec_id'])

                api.cinder.qos_spec_associate(request,
                                              qos_spec,
                                              data['vol_type_id'])
        except Exception:
            exceptions.handle(self.request,
                              _("Unable to associated the volume type with the QoS specs"))


@urls.register
class AddExtraSpecToVolumeType(generic.View):
    url_regex = r'cinder/addextraspectovoltype/$'

    @rest_utils.ajax()
    def post(self, request):
        try:
            data = request.DATA

            api.cinder.volume_type_extra_set(request,
                                             data['vol_type_id'],
                                             {data['extraSpecKey']: data['extraSpecValue']})
        except Exception:
            exceptions.handle(self.request,
                              _("Unable to add the extra specs to the volume type"))


@urls.register
class EditExtraSpecToVolumeType(generic.View):
    url_regex = r'cinder/editextraspecofvoltype/$'

    @rest_utils.ajax()
    def post(self, request):
        try:
            data = request.DATA

            api.cinder.volume_type_extra_set(request,
                                             data['vol_type_id'],
                                             {data['extraSpecKey']: data['extraSpecValue']})
        except Exception:
            exceptions.handle(self.request,
                              _("Unable to edit the extra specs of the volume type"))


@urls.register
class DeleteExtraSpecToVolumeType(generic.View):
    url_regex = r'cinder/deleteextraspecofvoltype/$'

    @rest_utils.ajax()
    def post(self, request):
        try:
            data = request.DATA
            api.cinder.volume_type_extra_delete(request,
                                                data['vol_type_id'],
                                                data['extraSpecKey'])
        except Exception:
            exceptions.handle(self.request,
                              _("Unable to delete the extra specs of the volume type"))


@urls.register
class QosSpecs(generic.View):
    url_regex = r'cinder/qosspecs/$'

    @rest_utils.ajax()
    def get(self, request):
        def _ensure_qos_specs(qos_specs):
            result = []
            for u in qos_specs:
                tmp = {}
                tmp['consumer'] = u._info['consumer']
                tmp['id'] = u._info['id']
                tmp['name'] = u._info['name']
                tmp['extraspecs'] = []
                for key,value in u.specs.iteritems():
                    tmp['extraspecs'].append({'id': key, 'key': key,'value': value})
                result.append(tmp)
            return result

        try:
            qos_specs = api.cinder.qos_spec_list(self.request)
        except Exception:
            qos_specs = []
            exceptions.handle(self.request,
                              _("Unable to retrieve QoS specs"))
        return {'items': _ensure_qos_specs(qos_specs)}

    @rest_utils.ajax(data_required=True)
    def post(self, request):

        data = request.DATA

        try:
            qos_spec = api.cinder.qos_spec_create(request,
                                              data['name'],
                                              {'consumer': data['consumer']})
        except Exception:
            exceptions.handle(self.request,
                              _("Unable to create the qos specs"))
        return request.DATA


@urls.register
class QosSpec(generic.View):
    url_regex = r'cinder/qosspecs/(?P<qos_spec_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, qos_spec_id):
        qos_spec = api.cinder.qos_spec_get(request, qos_spec_id)
        result = api.cinder.QosSpecs(qos_spec).to_dict()
        return {'items': result}

    @rest_utils.ajax()
    def delete(self, request, qos_spec_id):
        try:
            api.cinder.qos_spec_delete(request, qos_spec_id)
        except Exception:
            exceptions.handle(self.request,
                              _("Unable to delete the qos specs"))


@urls.register
class AddExtraSpecToQosSpec(generic.View):
    url_regex = r'cinder/addextraspectoqosspec/$'

    @rest_utils.ajax()
    def post(self, request):
        try:
            data = request.DATA

            # first retrieve current value of specs
            specs = api.cinder.qos_spec_get(request, data['vol_type_id'])
            # now add new key-value pair to list of specs
            specs.specs[data['extraSpecKey']] = data['extraSpecValue']
            api.cinder.qos_spec_set_keys(request,
                                         data['vol_type_id'],
                                         specs.specs)
        except Exception:
            exceptions.handle(self.request,
                              _("Unable to add the extra specs to the volume type"))


@urls.register
class EditExtraSpecToQosSpec(generic.View):
    url_regex = r'cinder/editextraspecofqosspec/$'

    @rest_utils.ajax()
    def post(self, request):
        try:
            data = request.DATA

            # first retrieve current value of specs
            specs = api.cinder.qos_spec_get_keys(request,
                                                 data['vol_type_id'],
                                                 raw=True)
            specs.specs[str(data['extraSpecKey'])] = data['extraSpecValue']
            api.cinder.qos_spec_set_keys(request,
                                         data['vol_type_id'],
                                         specs.specs)

        except Exception:
            exceptions.handle(self.request,
                              _("Unable to edit the extra specs of the qos spec"))


@urls.register
class DeleteExtraSpecToQosSpec(generic.View):
    url_regex = r'cinder/deleteextraspecofqosspec/$'

    @rest_utils.ajax()
    def post(self, request):
        data = request.DATA
        try:
            api.cinder.qos_spec_unset_keys(request,
                                           data['vol_type_id'],
                                           [data['extraSpecKey']])
        except Exception:
            exceptions.handle(self.request,
                              _("Unable to delete the extra specs of the qos spec"))


@urls.register
class VolumeToImage(generic.View):
    url_regex = r'cinder/volumetoimage/(?P<volume_id>.+)$'

    @rest_utils.ajax(data_required=True)
    def post(self, request, volume_id):
        response = api.cinder.volume_upload_to_image(
            request,
            volume_id=volume_id,
            image_name=request.DATA['name'],
            container_format='bare',
            disk_format='raw',
            force='True')
        new_volume_image = response[1]['os-volume_upload_image']
        return rest_utils.CreatedResponse(
            '/api/cinder/volumetoimage/%s' % new_volume_image['id'],
            new_volume_image
        )
