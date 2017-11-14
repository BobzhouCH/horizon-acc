(function() {
  "use strict";

  angular.module('hz.dashboard.project.images')
    .controller('ImageDetailCtrl', imageDetailCtrl);

  imageDetailCtrl.$inject = ['$location',
    'horizon.openstack-service-api.glance',
    'horizon.openstack-service-api.keystone'];

  function imageDetailCtrl($location, glanceAPI, keystoneAPI) {

    var ctrl = this;
    ctrl.label = {
      "launch": gettext("Launch"),
      "create_volume": gettext("Create Volume"),
      "edit": gettext("Edit"),
      "delete_image": gettext("Delete Image"),
      "detail_overview": gettext("Detail Overview"),
      "owner": gettext("Owner"),
      "status": gettext("Status"),
      "base_os": gettext("Base OS"),
      "size": gettext("Size"),
      "min_disk": gettext("Min. Disk"),
      "min_ram": gettext("Min. RAM"),
      "disk_format": gettext("Disk Format"),
      "container_format": gettext("Container Format"),
      "public": gettext("Public"),
      "protected": gettext("Protected"),
      "checksum": gettext("Checksum"),
      "created": gettext("Created Time"),
      "updated": gettext("Updated Time"),
      "id": gettext("ID"),
      "instances": gettext("Instances"),
      "metadata": gettext("Metadata"),
      "no_description": gettext("(No Description)"),
      "custom_properties": gettext("Custom Properties"),
      "kernel_id": gettext("Kernel ID"),
      "ramdisk_id": gettext("Ramdisk ID"),
      "architecture": gettext("Architecture"),
      "properties": gettext("Basic Properties"),
    };

    ctrl.imageStatus = {
      'active': gettext("Active"),
      'saving': gettext("Saving"),
      'queued': gettext("Queued"),
      'pending_delete': gettext("Pending Delete"),
      'killed': gettext("Killed"),
      'deleted': gettext("Deleted"),
    };

    // Fetch the Instance ID from the URL.
    var pattern = /(.*\/images\/)(detail\/)([0-9a-f-]*)?/;
    var imageId = $location.absUrl().match(pattern)[3];

    // Load the elements that are used in the overview.
    glanceAPI.getImage(imageId).success(function(image) {
      ctrl.image = image;

      // Based on the owner (tenant/owner), load the detail.
      //keystoneAPI.getProject(ctrl.image.owner).success(function(project) {
      //  ctrl.project = project;
      //});
    });

    ctrl.hasCustomProperties = function () {
      if (!ctrl.image) {
        return false;
      }
      var props = ctrl.image.properties;
      return (props && (props.kernel_id || props.ramdisk_id ||
        props.architecture ));
    };

  }

})();
