
# Copyright 2015, Hewlett-Packard Development Company, L.P.
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
"""API for the glance service.
"""

from itertools import izip
from django.conf import settings  # noqa
from django.views import generic

from easystack_dashboard import api
from easystack_dashboard.api.rest import utils as rest_utils
from easystack_dashboard.api.rest import urls
# begin:<wangxu17>:<BUG[76737])>:<action(a)>:<date(2016-12-06)>
from easystack_dashboard.api.glance import VERSIONS
# begin:<wangxu17>:<BUG[76737])>:<action(a)>:<date(2016-12-06)>

CLIENT_KEYWORDS = (
    'resource_type', 'marker', 'sort_dir', 'sort_key', 'paginate', 'image_type', 'all_projects')

IMAGE_BACKEND_SETTINGS = getattr(settings, 'OPENSTACK_IMAGE_BACKEND', {})
IMAGE_FORMAT_CHOICES = IMAGE_BACKEND_SETTINGS.get('image_formats', [])


@urls.register
class Image(generic.View):

    """API for retrieving a single image
    """
    url_regex = r'glance/image/(?P<image_id>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, image_id):
        """Get a of images.

        The listing result is an object with property "items". Each item is
        an image.

        """
        # begin:<wangxu17>:<BUG[76737])>:<action(a)>:<date(2016-12-06)>
        if VERSIONS.active < 2:
            return api.glance.image_get(request, image_id).to_dict()
        # end:<wangxu17>:<BUG[76737])>:<action(a)>:<date(2016-12-06)>
        return api.glance.Image(api.glance.image_get(request, image_id))

    @rest_utils.ajax()
    def delete(self, request, image_id):
        """Delete a specific image

        http://localhost/api/glance/images/cc758c90-3d98-4ea1-af44-aab405c9c915
        """
        return api.glance.image_delete(request, image_id)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, image_id):
        """Update a single image.
        """
        meta = {}
        can_update_fields = (
            'name', 'min_disk', 'min_ram', 'visibility', 'protected')
        meta.update(
            rest_utils.parse_filters_kwargs(request, can_update_fields)[1])
        # begin:<wangxu17>:<BUG[76737])>:<action(m)>:<date(2016-12-06)>
        if VERSIONS.active < 2 and meta.has_key('visibility'):
            meta['is_public'] = (meta['visibility'] == "public")
            del meta['visibility']
        image = api.glance.image_update(request, image_id, **meta)
        if VERSIONS.active < 2:
            return image.to_dict()
        # end:<wangxu17>:<BUG[76737])>:<action(m)>:<date(2016-12-06)>
        return api.glance.Image(image)


@urls.register
class ImageProperties(generic.View):
    """API for retrieving only a custom properties of single image.
    """
    url_regex = r'glance/images/(?P<image_id>[^/]+)/properties/'

    @rest_utils.ajax()
    def get(self, request, image_id):
        """Get custom properties of specific image.
        """
        objDict = getattr(api.glance.Image(api.glance.image_get(request, image_id)), 'properties')

        return rest_utils.ensure_image_prop_dict(objDict)

    @rest_utils.ajax(data_required=True)
    def patch(self, request, image_id):
        """Update custom properties of specific image.

        This method returns HTTP 204 (no content) on success.
        """
        api.glance.image_update_properties(
            request, image_id, request.DATA.get('removed'),
            **request.DATA['updated']
        )


@urls.register
class Images(generic.View):

    """API for Glance images.
    """
    url_regex = r'glance/images/$'

    @rest_utils.ajax()
    @rest_utils.admin_add_tenant_name('all_projects', 'owner')
    def get(self, request):
        """Get a list of images.

        The listing result is an object with property "items". Each item is
        an image.

        Example GET:
        http://localhost/api/glance/images?sort_dir=desc&sort_key=name&name=cirros-0.3.2-x86_64-uec  #flake8: noqa

        The following get parameters may be passed in the GET
        request:

        :param paginate: If true will perform pagination based on settings.
        :param marker: Specifies the namespace of the last-seen image.
             The typical pattern of limit and marker is to make an
             initial limited request and then to use the last
             namespace from the response as the marker parameter
             in a subsequent limited request. With paginate, limit
             is automatically set.
        :param sort_dir: The sort direction ('asc' or 'desc').
        :param sort_key: The field to sort on (for example, 'created_at').
             Default is created_at.

        Any additional request parameters will be passed through the API as
        filters. There are v1/v2 complications which are being addressed as a
        separate work stream: https://review.openstack.org/#/c/150084/
        """

        image_type = request.GET.get('image_type')
        filters, kwargs = rest_utils.parse_filters_kwargs(request,
                                                          CLIENT_KEYWORDS)

        images, has_more_data, has_prev_data = api.glance.image_list_detailed(
            request, filters=filters, **kwargs)
        if image_type:
            images = [i for i in images
                      if rest_utils.get_image_type(i) == image_type]
        items = []
        rest_utils.ensure_instances_detail_in_snapshot(request, images,
                                                       **filters)
        rest_utils.ensure_image_volume_id(request, images)

        if not api.keystone.is_cloud_admin(request):
            cur_tenant = request.user.tenant_id
        for item in images:
            item_dict = item.to_dict()
            if hasattr(item, 'instance_name'):
                item_dict.update({'instance_name': item.instance_name})
            if hasattr(item, 'volume_id'):
                item_dict.update({'volume_id': item.volume_id})
            if image_type:
                item_dict.update({'image_type': image_type})
            if hasattr(item, 'in_use'):
                item_dict.update({'in_use': item.in_use})
            # TODO: use this for v2 all image can be displayed whatever tenant, owner may be filter but now not work
            if not api.keystone.is_cloud_admin(request):
                if(('owner' in item_dict and item_dict['owner'] == cur_tenant)
                   or ('visibility' in item_dict and item_dict['visibility'] == u'public')
                   or ('is_public' in item_dict and item_dict['is_public'])):
                    items.append(item_dict)
            else:
                items.append(item_dict)

        return {
            'items': items,
            'has_more_data': has_more_data,
            'has_prev_data': has_prev_data,
        }

    def ensureMeta(self, request):
        if request.DATA['disk_format'] in ('ami', 'aki', 'ari',):
            container_format = request.DATA['disk_format']
        else:
            container_format = 'bare'

        meta = {'visibility': u'public' if request.DATA.has_key('is_public') else u'private' ,
                'protected': bool(request.DATA.get('protected', False)),
                'disk_format': request.DATA['disk_format'],
                'container_format': container_format,
                'min_disk': (int(request.DATA.get('min_disk')) or 0),
                'min_ram': (int(request.DATA.get('min_ram')) or 0),
                'name': request.DATA['name'],
                }

        # begin:<wangxu17>:<BUG[76737])>:<action(a)>:<date(2016-12-06)>
        if VERSIONS.active < 2 and meta.has_key('visibility'):
            meta['is_public'] = (meta['visibility'] == u'public')
            del meta['visibility']
        # end:<wangxu17>:<BUG[76737])>:<action(a)>:<date(2016-12-06)>
        if request.DATA['description']:
            meta['description'] = request.DATA['description']
        if request.DATA.get('copy_from', None):
            meta['copy_from'] = request.DATA['copy_from']
        else:
            meta['data'] = request.FILES['image_file']

        return meta

    # @rest_utils.ajax(data_required=True)
    def post(self, request):
        """Create a image.

        This action returns the new image object on success.
        """
        if not hasattr(request, 'DATA'):
            request.DATA = request.POST

        meta = self.ensureMeta(request)

        new_image = api.glance.image_create(request, **meta)
        # add tenant_name before return
        rest_utils.ensure_tenant_name(
            request, [new_image], tenant_id_str='owner')

        new_image_dict = new_image.to_dict()
        new_image_dict['tenant_name'] = new_image.tenant_name

        return rest_utils.CreatedResponse(
            '/api/keystone/users/%s' % new_image.id,
            new_image_dict
        )

    @rest_utils.ajax(data_required=True)
    def delete(self, request):
        """Delete multiple images by id.

        The DELETE data should be an application/json array of image ids to
        delete.

        This method returns HTTP 204 (no content) on success.
        """
        success = True
        results = {}

        for image_id in request.DATA:
            result = {'status': True}
            try:
                api.glance.image_delete(request, image_id)
            except Exception as e:
                success = False
                result['status'] = False
                result['error'] = e
            results.append(image_id, result)

        return results


@urls.register
class MetadefsNamespace(generic.View):

    """API for Glance Metadata Definitions.

       http://docs.openstack.org/developer/glance/metadefs-concepts.html
    """
    url_regex = r'glance/metadefs/namespaces/(?P<namespace>.+|default)$'

    @rest_utils.ajax()
    def get(self, request, namespace):
        """Get a specific metadata definition namespaces.

        Returns the namespace. GET params are passed through.

        Example GET:
        http://localhost/api/glance/metadefs/namespaces/OS::Compute::Watchdog
        """
        return api.glance.metadefs_namespace_get(request, namespace)


@urls.register
class MetadefsNamespaces(generic.View):

    """API for Single Glance Metadata Definitions.

       http://docs.openstack.org/developer/glance/metadefs-concepts.html
    """
    url_regex = r'glance/metadefs/namespaces/$'

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of metadata definition namespaces.

        The listing result is an object with property "items". Each item is
        a namespace.

        Example GET:
        http://localhost/api/glance/metadefs/namespaces?resource_types=OS::Nova::Flavor&sort_dir=desc&marker=OS::Compute::Watchdog&paginate=False&sort_key=namespace  #flake8: noqa

        The following get parameters may be passed in the GET
        request:

        :param resource_type: Namespace resource type.
            If specified returned namespace properties will have prefixes
            proper for selected resource type.
        :param paginate: If true will perform pagination based on settings.
        :param marker: Specifies the namespace of the last-seen namespace.
             The typical pattern of limit and marker is to make an
             initial limited request and then to use the last
             namespace from the response as the marker parameter
             in a subsequent limited request. With paginate, limit
             is automatically set.
        :param sort_dir: The sort direction ('asc' or 'desc').
        :param sort_key: The field to sort on (for example, 'created_at').
             Default is namespace. The way base namespaces are loaded into
             glance typically at first deployment is done in a single
             transaction giving them a potentially unpredictable sort result
             when using create_at.

        Any additional request parameters will be passed through the API as
        filters.
        """

        filters, kwargs = rest_utils.parse_filters_kwargs(
            request, CLIENT_KEYWORDS
        )

        names = ('items', 'has_more_data', 'has_prev_data')
        return dict(izip(names, api.glance.metadefs_namespace_full_list(
            request, filters=filters, **kwargs
        )))


@urls.register
class ImageFormats(generic.View):

    """API for Single Glance Metadata Definitions.

       http://docs.openstack.org/developer/glance/metadefs-concepts.html
    """
    url_regex = r'glance/imageformats/$'
    img_formats = None

    @classmethod
    def _init_img_formats(cls):
        formats = []
        for img_format in IMAGE_FORMAT_CHOICES:
            formats.append({'name': img_format[0],
                            'description': img_format[1]._proxy____args[0]
                            })
        cls.img_formats = formats
        return formats

    @rest_utils.ajax()
    def get(self, request):
        """Get a list of image formats.

        The listing result is an object with property "items". Each item is
        a image format.
        """
        if ImageFormats.img_formats is None:
            self._init_img_formats()

        return {
            'items': ImageFormats.img_formats,
        }
