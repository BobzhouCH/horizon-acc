/**
 * Copyright 2015 EasyStack Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

(function () {
    'use strict';

    angular.module('hz.dashboard.admin.instances')

    /**
     * @ngdoc adminInstancesCtrl
     * @ngController
     *
     * @description
     * Controller for the admin instances table.
     * Serve as the focal point for table actions.
     */
        .controller('adminInstancesCtrl', [
            '$scope', '$rootScope', 'horizon.openstack-service-api.policy',
            'horizon.openstack-service-api.nova',
            'horizon.openstack-service-api.glance',
            'horizon.framework.widgets.toast.service',
            'horizon.total.memory.service',
            'hz.dashboard.admin.instances.LiveMigrateAction',
            'hz.dashboard.admin.instances.ColdMigrateAction',
            'hz.dashboard.admin.instances.startInstanceAction',
            'hz.dashboard.admin.instances.shutoffInstanceAction',
            'hz.dashboard.admin.instances.deleteInstanceAction',
            'hz.dashboard.admin.instances.editInstanceAction',
            'hz.dashboard.admin.instances.createSnapshotAction',
            function (scope, rootScope, PolicyService, novaAPI, glanceAPI, toastService, totalMemoryService,
                      LiveMigrateAction, ColdMigrateAction, startInstanceAction, shutoffInstanceAction,
                      deleteInstanceAction, editInstanceAction, CreateSnapshotAction) {

                var self = this;

                scope.context = {
                    header: {
                        id: gettext('Instance ID'),
                        name: gettext('Name'),
                        domain: gettext('Domain'),
                        project: gettext('Project'),
                        host: gettext('Node'),
                        image: gettext('Image'),
                        addresses: gettext('Private IP'),
                        publicAddresses: gettext('Floating IP'),
                        flavor: gettext('Flavor'),
                        actualTotalMemory: gettext('Actual Total Memory(MB)'),
                        status: gettext('Status'),
                        task: gettext('Task'),
                        created: gettext('Create Time'),
                    },
                    error: {
                        api: gettext('Unable to retrieve instances'),
                        priviledge: gettext('Insufficient privilege level to view instance information.')
                    }
                };

                scope.instanceStatus = {
                    'ACTIVE': gettext("Active"),
                    'DELETED': gettext("Deleted"),
                    'BUILD': gettext('Build'),
                    'SHUTOFF': gettext("Shutoff"),
                    'SUSPENDED': gettext("Suspended"),
                    'PAUSED': gettext("Paused"),
                    'ERROR': gettext("Error"),
                    'RESIZE': gettext("Resize"),
                    'VERIFY_RESIZE': gettext("Confirm or Revert Migrate"),
                    'REVERT_RESIZE': gettext("Revert Resize"),
                    'REBOOT': gettext("Reboot"),
                    'HARD_REBOOT': gettext("Hard Reboot"),
                    'PASSWORD': gettext("Password"),
                    'REBUILD': gettext("Rebuild"),
                    'MIGRATING': gettext("Migrating"),
                    'RESCUE': gettext("Rescue"),
                    'SOFT_DELETED': gettext("Soft Delete"),
                    "powering-off": gettext("Powering Off"),
                    "powering-on": gettext("Powering On"),
                    "HOT-EXTENDING": gettext("Extending Root Device"),
                };

                scope.instanceTask = {
                    "scheduling": gettext("Scheduling"),
                    "block_device_mapping": gettext("Block Device Mapping"),
                    "networking": gettext("Networking"),
                    "spawning": gettext("Spawning"),
                    "image_snapshot": gettext("Snapshotting"),
                    "image_snapshot_pending": gettext("Image Snapshot Pending"),
                    "image_pending_upload": gettext("Image Pending Upload"),
                    "image_uploading": gettext("Image Uploading"),
                    "image_backup": gettext("Image Backup"),
                    "updating_password": gettext("Updating Password"),
                    "resize_prep": gettext("Preparing Migrate"),
                    "resize_migrating": gettext("Migrating"),
                    "resize_migrated": gettext("Migrated"),
                    "resize_finish": gettext("Finishing Migrate"),
                    "resize_reverting": gettext("Reverting Migrate"),
                    "resize_confirming": gettext("Confirming Migrate"),
                    "rebooting": gettext("Rebooting"),
                    "reboot_pending": gettext("Reboot Pending"),
                    "reboot_started": gettext("Reboot Started"),
                    "rebooting_hard": gettext("Rebooting Hard"),
                    "reboot_pending_hard": gettext("Reboot Pending Hard"),
                    "reboot_started_hard": gettext("Reboot Started Hard"),
                    "pausing": gettext("Pausing"),
                    "unpausing": gettext("Resuming"),
                    "suspending": gettext("Suspending"),
                    "resuming": gettext("Resuming"),
                    "powering-off": gettext("Powering Off"),
                    "powering-on": gettext("Powering On"),
                    "rescuing": gettext("Rescuing"),
                    "unrescuing": gettext("Unrescuing"),
                    "rebuilding": gettext("Rebuilding"),
                    "rebuild_block_device_mapping": gettext("Rebuild Block Device Mapping"),
                    "rebuild_spawning": gettext("Rebuild Spawning"),
                    "migrating": gettext("Migrating"),
                    "deleting": gettext("Deleting"),
                    "soft-deleting": gettext("Soft Deleting"),
                    "restoring": gettext("Restoring"),
                    "shelving": gettext("Shelving"),
                    "shelving_image_pending_upload": gettext("Shelving Image Pending Upload"),
                    "shelving_image_uploading": gettext("Shelving Image Uploading"),
                    "shelving_offloading": gettext("Shelving Offloading"),
                    "unshelving": gettext("Unshelving"),
                };

                this.clearSelected = function () {
                    scope.checked = {};
                    return scope.$table && scope.$table.resetSelected();
                };

                this.hasSelected = function (instance) {
                    return scope.$table.isSelected(instance);
                };

                this.removeSelected = function (instance) {
                    if (self.hasSelected(instance)) {
                        scope.checked[instance.id] = false;
                        scope.$table.unselectRow(instance);
                    }
                };

                this.initScope = function () {
                    scope.clearSelected = self.clearSelected;
                    scope.allowMenus = self.allowMenus;
                    scope.doAction = self.doAction;
                    scope.updateInstance = self.updateInstance;

                    scope.actions = {
                        refresh: self.refresh,
                        createsnapshot: new CreateSnapshotAction(scope),
                        liveMigrate: new LiveMigrateAction(scope),
                        coldMigrate: new ColdMigrateAction(scope),
                        startInstanceAction: new startInstanceAction(scope),
                        shutoffInstanceAction: new shutoffInstanceAction(scope),
                        deleteInstanceAction: new deleteInstanceAction(scope),
                        editInstanceAction: new editInstanceAction(scope),
                    };
                };

                this.reset = function () {
                    scope.instances = [];
                    scope.iinstances = [];
                    scope.iinstancesState = false;

                    //Check if action can be clicked when multi select instance.
                    scope.shutofftag = true;
                    scope.starttag = true;
                    scope.deletetag = true;
                    scope.compute_nodes = 0;

                    scope.disableSnapshot = true;
                    scope.disableColdMigrate = true;
                    scope.disableliveMigrate = true;

                    self.clearSelected();
                    toastService.clearAll();
                };

                this.startUpdateStatus = function (interval) {
                    var statusList = ['BUILD', 'VERIFY_RESIZE', 'STOPPING', 'PENDING', 'DELETING', 'SHUTOFF', 'powering-off', 'suspending', 'powering-on',"HOT-EXTENDING"];

                    function checkStatus() {
                        var instances = scope.instances;
                        for (var i = 0; i < instances.length; i++) {
                            var instance = instances[i];
                            var state = instance['OS-EXT-STS:task_state'];
                            // update it if need
                            if ((state && instance.status != "ERROR") || statusList.contains(instance.status)) {
                                self.updateInstance(instance);
                            }
                        }
                    }

                    // start the timer
                    setInterval(checkStatus, interval);
                };

                this.init = function () {
                    self.initScope();
                    self.refresh();
                    self.startUpdateStatus(10000);

                    scope.$watch('numSelected', function (current, old) {
                        if (current != old)
                            self.allowMenus(scope.selectedData.aData);
                    });
                };

                this.formatInstance = function (instance) {
                    instance.created = instance.created.replace(/T/g, ' ');
                    instance.created = instance.created.replace(/Z/g, '');
                    instance.created = rootScope.rootblock.utc_to_local(instance.created);
                    instance.hostname = instance['OS-EXT-SRV-ATTR:host'];


                    instance.floating_ips = formatNetworks(instance.ip_groups, 'floating');
                    instance.non_floating_ips = formatNetworks(instance.ip_groups, 'non_floating');
                };

                function formatNetworks(ipGroups, floating) {
                    var showName = (floating != 'floating');
                    var ipsList = [];
                    for (var name in ipGroups) {
                        var ipList = [];
                        var ips = ipGroups[name];
                        var ips = ips[floating];
                        for (var i = 0; ips && i < ips.length; i++) {
                            ipList.push(ips[i].addr);
                        }
                        if (ipList.length) {
                            var ip = "";
                            if (showName)
                                ip = "{0}: {1}".format(name, ipList.join(" "));
                            else
                                ip = ipList.join(" ");
                            ipsList.push(ip);
                        }
                    }
                    if (ipsList.length)
                        return ipsList.join(", ");
                    else
                        return "-";
                };

                this.doAction = function (context, instances, action) {
                    for (var n = 0; n < instances.length; n++) {
                        var instance = instances[n];
                        (function (instance) {
                            action(instance.id)
                                .success(function () {
                                    var message = interpolate(context.success, [instance.name]);
                                    toastService.add('success', gettext(message));
                                    // update the status
                                    self.updateInstance(instance);
                                })
                                .error(function () {
                                    var message = interpolate(context.error, [instance.name]);
                                    toastService.add('error', gettext(message));
                                });
                        })(instance);
                    }
                    scope.clearSelected();
                };

                this.updateInstance = function (instance) {
                    novaAPI.refreshServer(instance.id)
                        .success(function (response) {
                            // convert utc to local time
                            self.formatInstance(response);
                            // update the instance
                            // update the instance
                            if (instance.status === 'suspending' && response.status != 'SUSPENDED') {
                                response.status = 'suspending';
                            } else if (instance.status === 'powering-off' && response.status != 'SHUTOFF') {
                                response.status = 'powering-off';
                            } else if (instance.status === 'powering-on' && response.status != 'ACTIVE') {
                                response.status = 'powering-on';
                            }
                            angular.extend(instance, response);

                            if ("ACTIVE" === response.status) {
                                self.updateTotalMemory(instance, 3);
                            } else {
                                instance.totalMemory = {size: '', status: 'error'};
                            }

                            // update the menus
                            if (self.hasSelected(instance)) {
                                self.allowMenus(scope.selectedData.aData);
                            }
                        })
                        .error(function (response, status) {
                            // remove the instance if needed
                            if (status == 404) {
                                self.removeSelected(instance);
                                scope.instances.removeId(instance.id);
                            }
                        });
                };


                // on load, if user has permission
                // fetch table data and populate it
                this.refresh = function () {
                    self.reset();
                    PolicyService.check({rules: [['identity', 'identity:get_cloud_admin_resources']]})
                        .success(function (response) {
                            if (response.allowed) {
                                listServers();
                                listSnapshots();
                            }
                            else {
                                toastService.add('info', scope.context.error.priviledge);
                                window.location.replace((window.WEBROOT || '') + 'auth/logout');
                            }
                        });

                    function listServers() {
                        novaAPI.getServers({all_tenants: 'True'})
                            .success(function (response) {
                                // convert utc to local time
                                if (response.items) {
                                    angular.forEach(response.items, function (item) {
                                        self.formatInstance(item);

                                        if ("ACTIVE" === item.status) {
                                            item.totalMemory = {size: '', status: 'suspending'};
                                            //hejing7: Bug 98285 Retrive Total memory, retry 3 times, if still no data, set flavor ram
                                            self.updateTotalMemory(item, 3);
                                        } else {
                                            item.totalMemory = {size: '', status: 'error'};
                                        }

                                    });
                                    if (response.items.length > 0) {
                                        countComputeNodes();
                                    }
                                }
                                scope.instances = response.items;
                                scope.iinstancesState = true;
                            });
                    }

                    function countComputeNodes() {
                        novaAPI.getHypervisors('All').success(function (data) {
                            var compute_nodes = 0;
                            if (data.items) {
                                angular.forEach(data.items, function (item) {
                                    if (item.hypervisor_type == 'QEMU' && item.state == 'up' && item.status == 'enabled') {
                                        compute_nodes = compute_nodes + 1;
                                    }
                                });
                            }
                            scope.compute_nodes = compute_nodes;
                        });
                    }

                    function listSnapshots() {
                        // In order to determine whether the instance is created the snapshot.
                        // So get all the snapshots.
                        glanceAPI.getImages({image_type: 'snapshot'})
                            .success(function (response) {
                                scope.snapshotsData = response.items;
                            });
                    }
                };

                this.updateTotalMemory = function (instance, retries) {
                    if (instance.totalMemory === undefined) {
                        instance.totalMemory = {size: '', status: 'suspending'};
                    }
                    instance && instance.id && totalMemoryService.getTotalMemory(instance.id)
                        .success(function (response){
                            if (response.actual) {
                                instance.totalMemory.size = Math.floor(response.actual/1024);
                                instance.totalMemory.status = 'success';
                            } else if ( retries > 0 ) {
                                retries -= 1;
                                instance.totalMemory.status = 'suspending';
                                setTimeout(function () {
                                    self.updateTotalMemory(instance, retries);
                                }, 1000);
                            } else {
                                instance.totalMemory.status = 'error';
                               // toastService.add('error', gettext(instance.name + ': Unable to retrieve getTotalMemory records.'));
                            }
                        })
                        .error(function () {
                            if( retries > 0 ) {
                                retries -= 1;
                                instance.totalMemory.status = 'suspending';
                                setTimeout(function () {
                                    self.updateTotalMemory(instance, retries);
                                }, 1000);
                            } else {
                                instance.totalMemory.status = 'error';
                               // toastService.add('error', gettext(instance.name + ': Unable to retrieve getTotalMemory records.'));
                            }
                        });
                };

                var ANY = "any";
                var NONE = "null";
                //begin:jiaozh1:update:2016-11-23:bug:Bugzilla - bug 75710
                this.checkInstancesStatusIn = function (instances, expectedStatusList, expectedTaskStates, currentactionType) {
                    var actionTypes = ['allowColdMigrate', 'allowSnapshot', 'allowshutoff', 'allowstart', 'allowdelete', 'allowLiveMigrate'];
                    if (instances.length == 0) {
                        scope.disabled = true;
                        return false;
                    }
                    if (self.instance_hashost_down == true) {
                        if (actionTypes.contains(currentactionType)) {
                            return false;
                        }
                    }

                    var noTaskStates = ['deleting'];

                    // expectedStatusList=null means the status could be any
                    if (!expectedStatusList)
                        expectedStatusList = self.ANY;

                    // expectedTaskStates=null means the task state must be null
                    if (!expectedTaskStates)
                        expectedTaskStates = self.NONE;

                    for (var i = 0; i < instances.length; i++) {
                        var status = instances[i].status;
                        var taskState = instances[i]['OS-EXT-STS:task_state'];
                        // must be not in unexpected task states
                        if (noTaskStates.contains(taskState))
                            return false;
                        // must be in expected status
                        else if (expectedStatusList !== self.ANY && !expectedStatusList.contains(status))
                            return false;
                        // task state must be null
                        else if (expectedTaskStates === self.NONE && taskState)
                            return false;
                        // must be in expected task states
                        else if (expectedTaskStates !== self.ANY && !expectedTaskStates.contains(taskState) && taskState)
                            return false;
                    }
                    return true;
                };

                /* begining of ---- update menu state*/
                this.allowColdMigrate = function (instances) {
                    scope.disableColdMigrate = !self.checkInstancesStatusIn(instances, ["ACTIVE", "SHUTOFF"], undefined, 'allowColdMigrate');
                };
                /* end of ---- update menu state*/

                this.allowLiveMigrate = function (instances) {
                    scope.disableLiveMigrate = !self.checkInstancesStatusIn(instances, ["ACTIVE"], undefined, 'allowLiveMigrate');
                };

                //Check if action can be clicked when multi select instance.
                this.allowMenus = function (instances) {
                    self.instance_hashost_down = false;
                    for (var i = 0; i < instances.length; i++) {
                        if (instances[i]['host-compute-service-status'] == 'down') {
                            self.instance_hashost_down = true;
                            break;
                        }
                    }

                    self.allowColdMigrate(instances);
                    self.allowLiveMigrate(instances);

                    self.allowSnapshot(instances);
                    self.allowshutoff(instances);
                    self.allowstart(instances);
                    self.allowdelete(instances);
                    self.allowInstancesEdit(instances);
                };

                this.allowstart = function (instances) {
                    scope.starttag = !self.checkInstancesStatusIn(instances, ["SHUTDOWN", "SHUTOFF", "CRASHED"], self.ANY, 'allowstart');
                };

                this.allowshutoff = function (instances) {
                    scope.shutofftag = !self.checkInstancesStatusIn(instances, ["ACTIVE", "SUSPEND"], self.ANY, 'allowshutoff');
                };

                this.allowdelete = function (instances) {
                    scope.deletetag = !self.checkInstancesStatusIn(instances, self.ANY, ["scheduling"], 'allowdelete');
                };

                this.allowInstancesEdit = function (instances) {
                    scope.editInstanceTag = self.checkInstancesStatusIn(instances, ["ERROR"]);
                };

                this.allowSnapshot = function (instances) {
                    scope.disableSnapshot = !self.checkInstancesStatusIn(instances, ["ACTIVE", "SHUTOFF", "PAUSED", "SUSPENDED"], undefined, 'allowSnapshot');
                };
                //end:jiaozh1:update:2016-11-23:bug:Bugzilla - bug 75710
                scope.filterFacets = [{
                    label: gettext('Name'),
                    name: 'name',
                    singleton: true
                }, {
                    label: gettext('Domain'),
                    name: 'domain',
                    singleton: true
                }, {
                    label: gettext('Project'),
                    name: 'tenant_name',
                    singleton: true
                }, {
                    label: gettext('Node'),
                    name: 'hostname',
                    singleton: true
                }, {
                    label: gettext('Image'),
                    name: 'image_display_name',
                    singleton: true
                }, {
                    label: gettext('Floating IP'),
                    name: 'floating_ips',
                    singleton: true
                }, {
                    label: gettext('Private IP'),
                    name: 'non_floating_ips',
                    singleton: true
                }, {
                    label: gettext('Flavor') + ':CPU',
                    name: 'flavor.vcpus',
                    singleton: true
                }, {
                    label: gettext('Flavor') + ':RAM',
                    name: 'flavor.ram',
                    singleton: true
                }, {
                    label: gettext('Flavor') + ':DISK',
                    name: 'flavor.disk',
                    singleton: true
                },{
                    label: gettext('Actual Total Memory(MB)'),
                    name: 'totalMemory.size',
                    singleton: true
                },  {
                    label: gettext('Status'),
                    name: 'status',
                    singleton: true,
                    options: [
                        {label: scope.instanceStatus.ACTIVE, key: 'ACTIVE'},
                        {label: scope.instanceStatus.DELETED, key: 'DELETED'},
                        {label: scope.instanceStatus.BUILD, key: 'BUILD'},
                        {label: scope.instanceStatus.SHUTOFF, key: 'SHUTOFF'},
                        {label: scope.instanceStatus.SUSPENDED, key: 'SUSPENDED'},
                        {label: scope.instanceStatus.PAUSED, key: 'PAUSED'},
                        {label: scope.instanceStatus.ERROR, key: 'ERROR'},
                        {label: scope.instanceStatus.RESIZE, key: 'RESIZE'},
                        {label: scope.instanceStatus.VERIFY_RESIZE, key: 'VERIFY_RESIZE'},
                        {label: scope.instanceStatus.REVERT_RESIZE, key: 'REVERT_RESIZE'},
                        {label: scope.instanceStatus.REBOOT, key: 'REBOOT'},
                        {label: scope.instanceStatus.HARD_REBOOT, key: 'HARD_REBOOT'},
                        {label: scope.instanceStatus.PASSWORD, key: 'PASSWORD'},
                        {label: scope.instanceStatus.REBUILD, key: 'REBUILD'},
                        {label: scope.instanceStatus.MIGRATING, key: 'MIGRATING'},
                        {label: scope.instanceStatus.RESCUE, key: 'RESCUE'},
                        {label: scope.instanceStatus.SOFT_DELETED, key: 'SOFT_DELETED'},
                    ]
                }, {
                    label: gettext('Create Time'),
                    name: 'created',
                    singleton: true
                }];

                this.init();

            }])

        .filter("formatNetworks", function () {
            return function (ipGroups, floating) {
                var showName = (floating != 'floating');
                var ipsList = [];
                for (var name in ipGroups) {
                    var ipList = [];
                    var ips = ipGroups[name];
                    var ips = ips[floating];
                    for (var i = 0; ips && i < ips.length; i++) {
                        ipList.push(ips[i].addr);
                    }
                    if (ipList.length) {
                        var ip = "";
                        if (showName)
                            ip = "{0}: {1}".format(name, ipList.join(" "));
                        else
                            ip = ipList.join(" ");
                        ipsList.push(ip);
                    }
                }
                if (ipsList.length)
                    return ipsList;
                else
                    return ["-"];
            };
        });

})();
