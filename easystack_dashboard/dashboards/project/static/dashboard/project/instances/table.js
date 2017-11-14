/**
 * Copyright 2015 EasyStack Inc.
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

    angular.module('hz.dashboard.project.instances')

    /**
     * @ngdoc projectInstancesCtrl
     * @ngController
     *
     * @description
     * Controller for the project instances table.
     * Serve as the focal point for table actions.
     */
        .controller('projectInstancesCtrl', [
            '$scope', '$rootScope',
            'horizon.openstack-service-api.policy',
            'horizon.openstack-service-api.glance',
            'horizon.openstack-service-api.usersettings',
            'horizon.openstack-service-api.keystone',
            'horizon.openstack-service-api.nova',
            'horizon.openstack-service-api.settings',
            'horizon.total.memory.service',
            'horizon.framework.widgets.toast.service', 'createSnapshotAction',
            'attachVolume2MeAction', 'detachVolume4MeAction', 'shutoffInstanceAction', 'startInstanceAction',
            'softrebootInstanceAction', 'suspendInstanceAction', 'resumeInstanceAction', 'pauseInstanceAction',
            'unpauseInstanceAction', 'deleteInstanceAction',
            'associateFloatingIpAction', 'disassociateFloatingIpAction', 'editInstanceAction', 'instanceDetailAction',
            'launchInstanceModel', 'AwslaunchInstanceModel', 'associateNetAction', 'disassociateNetAction', 'instanceMonitorAction',
            //'instanceSecurityGroupAction', 'rebuildInstanceAction', 'ResizeInstanceAction', 'noVNCConsole', '$location',
            'instanceSecurityGroupAction', 'rebuildInstanceAction', 'ResizeInstanceAction', 'totalMemoryAction', 'noVNCConsole', '$window', 'HotExtendDiskAction',
            function (scope, rootScope, PolicyService, glanceAPI, usersettingAPI, keystoneAPI, novaAPI, settingsAPI, totalMemoryService, toastService, CreateSnapshotAction,
                      AttachVolumeAction, DetachVolumeAction, shutoffInstanceAction, startInstanceAction,
                      softrebootInstanceAction, suspendInstanceAction, resumeInstanceAction,
                      pauseInstanceAction, unpauseInstanceAction, deleteInstanceAction,
                      AssociateFloatingIpAction, DisassociateFloatingIpAction, editInstanceAction, CreateDetailAction,
                      instanceModel, AwslaunchInstanceModel, associateNetAction, disassociateNetAction, instanceMonitorAction,
                      //editSecGroup, rebuildInstanceAction, ResizeInstanceAction, noVNCConsole, $location
                      editSecGroup, rebuildInstanceAction, ResizeInstanceAction, TotalMemoryAction, noVNCConsole, $window, HotExtendDiskAction) {
                var self = this;

                scope.context = {
                    header: {
                        id: gettext('Instance ID'),
                        name: gettext('Name'),
                        image: gettext('Image'),
                        addresses: gettext('Private IP'),
                        publicAddresses: gettext('Floating IP'),
                        flavor: gettext('Flavor'),
                        actualTotalMemory: gettext('Actual Total Memory(MB)'),
                        status: gettext('Status'),
                        task: gettext('Task'),
                        created: gettext('Create Time')
                    },
                    error: {
                        api: gettext('Unable to retrieve instances'),
                        priviledge: gettext('Insufficient privilege level to view instance information.')
                    }
                };
                instanceModel._scope = scope;
                AwslaunchInstanceModel._scope = scope;

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
                    'STOPPING': gettext("Stopping"),
                    'PENDING': gettext("Pending"),
                    "suspending": gettext("Suspending"),
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
                    "resize_prep": gettext("Preparing Resize"),
                    "resize_migrating": gettext("Resizing"),
                    "resize_migrated": gettext("Resized or Migrated"),
                    "resize_finish": gettext("Finishing Resize"),
                    "resize_reverting": gettext("Reverting Resize"),
                    "resize_confirming": gettext("Confirming Resize"),
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
                    "unshelving": gettext("Unshelving")
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

                this.reset = function () {
                    scope.instanceState = false;
                    scope.instances = [];
                    scope.iinstances = [];

                    //Check if action can be clicked when multi select instance.
                    scope.shutofftag = true;
                    scope.starttag = true;
                    scope.reboottag = true;
                    scope.suspendtag = true;
                    scope.resumetag = true;
                    scope.pausetag = true;
                    scope.unpausetag = true;
                    scope.deletetag = true;
                    scope.novnctag = true;

                    scope.disableSnapshot = true;
                    scope.disableResize = true;
                    scope.disableTotalMemory = true;
                    scope.disableAttachVolume = true;
                    scope.disableDetachVolume = true;
                    scope.disableAssFloatingIp = true;
                    scope.disableDisassFloatingIp = true;
                    scope.disableAssNet = true;
                    scope.disableDisassNet = true;
                    scope.disableRebuild = true;

                    self.clearSelected();
                    toastService.clearAll();
                };

                this.initScope = function () {
                    scope.clearSelected = self.clearSelected;
                    scope.allowMenus = self.allowMenus;
                    scope.doAction = self.doAction;
                    scope.updateInstance = self.updateInstance;
                    scope.REBUILD_ON_LVM_ENABLED = false;

                    scope.actions = {
                        refresh: self.refresh,
                        createsnapshot: new CreateSnapshotAction(scope),
                        attachVolume: new AttachVolumeAction(scope),
                        detachVolume: new DetachVolumeAction(scope),
                        associateFloatingIp: new AssociateFloatingIpAction(scope),
                        disassociateFloatingIp: new DisassociateFloatingIpAction(scope),
                        shutoffInstanceAction: new shutoffInstanceAction(scope),
                        startInstanceAction: new startInstanceAction(scope),
                        softrebootInstanceAction: new softrebootInstanceAction(scope),
                        suspendInstanceAction: new suspendInstanceAction(scope),
                        resumeInstanceAction: new resumeInstanceAction(scope),
                        pauseInstanceAction: new pauseInstanceAction(scope),
                        unpauseInstanceAction: new unpauseInstanceAction(scope),
                        deleteInstanceAction: new deleteInstanceAction(scope),
                        editInstanceAction: new editInstanceAction(scope),
                        createDetail: new CreateDetailAction(scope),
                        associateNet: new associateNetAction(scope),
                        rebuildInstance: new rebuildInstanceAction(scope),
                        disassociateNet: new disassociateNetAction(scope),
                        instanceMonitorAction: new instanceMonitorAction(scope),
                        editSecGroup: new editSecGroup(scope),
                        resizeInstanceAction: new ResizeInstanceAction(scope),
                        totalMemoryAction: new TotalMemoryAction(scope),
                        noVNCConsole: new noVNCConsole(scope),
                        hotExtendDiskAction: new HotExtendDiskAction(scope),
                    };
                };

                this.getInstanceById = function (id, instances) {
                    var result = new Object();
                    angular.forEach(instances, function (instance) {
                        if (id == instance.id) {
                            result = instance;
                        }
                    })
                    return result;
                };

                this.refresh = function () {
                    scope.disableCreate = false;
                    self.reset();
                    PolicyService.check({rules: []})
                        .success(function (response) {
                            if (response.allowed) {
                                novaAPI.getServers()
                                    .success(function (response) {
                                        // convert utc to local time
                                        // var totalMemory = {};
                                        if (response.items) {
                                            angular.forEach(response.items, function (item) {
                                                self.formatInstance(item);
                                                //filter the bare metal instances
                                                if (!(item.image.hasOwnProperty('properties') &&
                                                    item.image.properties.hasOwnProperty('hypervisor_type') &&
                                                    item.image.properties.hypervisor_type.indexOf('baremetal') !== -1 )) {
                                                    scope.instances.push(item);
                                                }

                                                if ("ACTIVE" === item.status) {
                                                    item.totalMemory = {size: '', status: 'suspending'};
                                                    //hejing7: Bug 98285 Retrive Total memory, retry 3 times, if still no data, set flavor ram
                                                    self.updateTotalMemory(item, 3);
                                                } else {
                                                    item.totalMemory = {size: '', status: 'error'};
                                                }

                                            });

                                            //var current_url = $location.absUrl();
                                            //var current_url = location.href;
                                            var current_url = $window.location.href;
                                            var start = current_url.indexOf('#');
                                            if (start != -1) {
                                                var param = current_url.substr(start + 2);
                                                var instance = self.getInstanceById(param, response.items);
                                                if (instance) {
                                                    scope.actions.createDetail.open(instance);
                                                }
                                            }
                                        }
                                        scope.instanceState = true;
                                        keystoneAPI.getCurrentUserSession()
                                            .success(function (response) {
                                                usersettingAPI.getComponentQuota(response.project_id, {
                                                    only_quota: true,
                                                    component_name: 'nova'
                                                })
                                                    .success(function (data) {
                                                        for (var i = 0; i < data.items.length; i++) {
                                                            if (data.items[i].name === 'instances') {
                                                                scope.quota = (data.items[i].usage.quota == -1 ? Number.MAX_VALUE : data.items[i].usage.quota);
                                                                break;
                                                            }
                                                        }
                                                    });
                                            });
                                    });

                                // In order to determine whether the instance is created the snapshot.
                                // So get all the snapshots.
                                glanceAPI.getImages({image_type: 'snapshot'})
                                    .success(function (response) {
                                        scope.snapshotsData = response.items;
                                    });

                            } else if (horizon) {
                                toastService.add('info', scope.context.error.priviledge);
                            }
                        });
                };

                this.startUpdateStatus = function (interval) {
                    var statusList = ['BUILD', 'VERIFY_RESIZE', 'STOPPING', 'PENDING', 'DELETING', 'DELETED', 'powering-off', 'suspending', 'powering-on',"HOT-EXTENDING"];
                    if (ISPUBLICREGION === 'True') {
                        statusList.push('SHUTOFF');
                    }
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

                // on load, if user has permission
                // fetch table data and populate it
                this.init = function () {
                    self.initScope();
                    self.refresh();
                    self.startUpdateStatus(10000);

                    scope.$watch('numSelected', function (current, old) {
                        if (current != old)
                            self.allowMenus(scope.selectedData.aData);
                    });
                    settingsAPI.getSetting('REBUILD_ON_LVM_ENABLED', false).then(function (enabled) {
                        scope.REBUILD_ON_LVM_ENABLED = enabled;
                    });
                };

                this.formatInstance = function (instance) {
                    instance.created = instance.created.replace(/T/g, ' ');
                    instance.created = instance.created.replace(/Z/g, '');
                    instance.created = rootScope.rootblock.utc_to_local(instance.created);

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
                            if (instance.status === 'suspending' && response.status != 'SUSPENDED') {
                                response.status = 'suspending';
                            } else if (instance.status === 'powering-off' && response.status != 'SHUTOFF') {
                                response.status = 'powering-off';
                            } else if (instance.status === 'powering-on' && response.status != 'ACTIVE') {
                                response.status = 'powering-on';
                            }
                            angular.extend(instance, response);

                            //var statusList = ['BUILD', 'VERIFY_RESIZE', 'STOPPING', 'PENDING', 'DELETING', 'DELETED', 'powering-off', 'suspending', 'powering-on',"HOT-EXTENDING"];
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


                var ANY = "any";
                var NONE = "null";
                //begin:jiaozh1:update:2016-11-23:bug:Bugzilla - bug 75710
                this.checkInstancesStatusIn = function (instances, expectedStatusList, expectedTaskStates, currentactionType) {
                    var actionTypes = ['allowSnapshot', 'allowResize', 'allowsuspend', 'allowresume', 'allowpause', 'allowunpause',
                        'allowreboot', 'allowAttachVolume', 'allowDetachVolume', 'allowRebuild', 'allowstart', 'allowshutoff', 'allowdelete', 'allowHotExtend','allowSetMemory'];
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

                /* start of ---- update menu state*/
                this.allowSnapshot = function (instances) {
                    scope.disableSnapshot = !self.checkInstancesStatusIn(instances, ["ACTIVE", "SHUTOFF", "PAUSED", "SUSPENDED"], undefined, 'allowSnapshot');
                };

                this.allowResize = function (instances) {
                    scope.disableResize = !self.checkInstancesStatusIn(instances, ["ACTIVE", "SHUTOFF"], undefined, 'allowResize');
                };

                this.allowHotExtendvDisk = function (instances) {
                    scope.disableHotExtend = !self.checkInstancesStatusIn(instances, ["ACTIVE"], undefined, 'allowHotExtend');
                };

                this.allowSetMemory = function (instances) {
                    scope.disableMemory = !self.checkInstancesStatusIn(instances, ["ACTIVE"], undefined, 'allowSetMemory');
                };

                this.allowAttachVolume = function (instances) {
                    scope.disableAttachVolume = !self.checkInstancesStatusIn(instances, ["ACTIVE", "PAUSED", "SHUTOFF", "RESIZED"], undefined, 'allowAttachVolume');
                };

                this.allowDetachVolume = function (instances) {
                    //scope.disableDetachVolume = !self.checkInstancesStatusIn(instances, ["ACTIVE", "PAUSED", "SHUTOFF", "RESIZED"], undefined, 'allowDetachVolume');
                    scope.disableDetachVolume = !self.checkInstancesStatusIn(instances, ["ACTIVE", "SHUTOFF", "RESIZED"], undefined, 'allowDetachVolume');
                    /*
                     //if no attached vlume, disable it
                     if(!scope.disableDetachVolume) {
                     for (var i = 0; i < instances.length; i++) {
                     var volumes = instances[i]['os-extended-volumes:volumes_attached'];
                     if(!volumes)
                     scope.disableDetachVolume = true;
                     else if(volumes && volumes.length == 0)
                     scope.disableDetachVolume = true;
                     }
                     }
                     */
                };

                this.allowAssFloatingIp = function (instances) {
                    //any status, but task state must be null
                    scope.disableAssFloatingIp = self.checkInstancesStatusIn(instances, ["ERROR"]);
                };

                this.allowDisassFloatingIp = function (instances) {
                    //any status, but task state must be null
                    scope.disableDisassFloatingIp = self.checkInstancesStatusIn(instances, ["ERROR"]);
                };

                this.allowAssNet = function (instances) {
                    scope.disableAssNet = !self.checkInstancesStatusIn(instances, ["ACTIVE", "PAUSED", "SHUTOFF"]);
                };
                this.allowEditSecGroup = function (instances) {
                    scope.editSecGroupTag = self.checkInstancesStatusIn(instances, ["ERROR"]);
                };
                this.isEmptyObject = function (obj) {
                    var name;
                    for (name in obj) {
                        return false;
                    }
                    return true;
                };

                this.hasEmptyNics = function (instances) {
                    var empty = false;
                    instances.some(function (item) {
                        var addresses = item['addresses'];
                        empty = addresses ? self.isEmptyObject(addresses) : true;
                        return empty;
                    });
                    return empty;
                };

                this.allowDisassNet = function (instances) {
                    scope.disableDisassNet = !self.checkInstancesStatusIn(instances, ["ACTIVE", "PAUSED", "SHUTOFF"]);
                    if (!scope.disableDisassNet) {
                        scope.disableDisassNet = self.hasEmptyNics(instances);
                    }
                };

                this.allowRebuild = function (instances) {

                    var disableRe = false,
                        snapshotsData = scope.snapshotsData,
                        checkStatus = self.checkInstancesStatusIn(instances, ["ACTIVE", "PAUSED", "SHUTOFF"], undefined, 'allowRebuild');

                    function checkInstance() {
                        scope.disableRebuild = !checkStatus || disableRe;
                    };

                    checkInstance();

                    if (checkStatus && snapshotsData && !scope.REBUILD_ON_LVM_ENABLED) {
                        for (var i = 0; i < snapshotsData.length; i++) {
                            if (instances.length == 1 && snapshotsData[i]['properties'] && snapshotsData[i]['properties']['instance_uuid'] === instances[0]['id']) {
                                disableRe = true;
                                checkInstance();
                            }
                        }
                    }
                };

                this.allowshutoff = function (instances) {
                    scope.shutofftag = !self.checkInstancesStatusIn(instances, ["ACTIVE", "SUSPEND"], self.ANY, 'allowshutoff');
                };

                this.allownovnc = function (instances) {
                    scope.novnctag = !self.checkInstancesStatusIn(instances, ["ACTIVE"]);
                };

                this.allowstart = function (instances) {
                    scope.starttag = !self.checkInstancesStatusIn(instances, ["SHUTDOWN", "SHUTOFF", "CRASHED"], self.ANY, 'allowstart');
                };
                this.allowreboot = function (instances) {
                    scope.reboottag = !self.checkInstancesStatusIn(instances, ["ACTIVE"], undefined, 'allowreboot');
                };
                this.allowsuspend = function (instances) {
                    scope.suspendtag = !self.checkInstancesStatusIn(instances, ["ACTIVE"], undefined, 'allowsuspend');
                };
                this.allowresume = function (instances) {
                    scope.resumetag = !self.checkInstancesStatusIn(instances, ["SUSPENDED"], undefined, 'allowresume');
                };
                this.allowpause = function (instances) {
                    scope.pausetag = !self.checkInstancesStatusIn(instances, ["ACTIVE"], undefined, 'allowpause');
                };
                this.allowunpause = function (instances) {
                    scope.unpausetag = !self.checkInstancesStatusIn(instances, ["PAUSED"], undefined, 'allowunpause');
                };
                this.allowdelete = function (instances) {
                    scope.deletetag = !self.checkInstancesStatusIn(instances, self.ANY, ["scheduling"], 'allowdelete');

                };
                this.allowInstanceMonitor = function (instances) {
                    scope.instanceMonitorTag = self.checkInstancesStatusIn(instances, ["ERROR"]);
                };
                this.allowInstancesEdit = function (instances) {
                    scope.editInstanceTag = self.checkInstancesStatusIn(instances, ["ERROR"]);
                };
                /* end of ---- update menu state*/

                //Check if action can be clicked when multi select instance.
                this.allowMenus = function (instances) {
                    self.instance_hashost_down = false;
                    for (var i = 0; i < instances.length; i++) {
                        if (instances[i]['host-compute-service-status'] == 'down') {
                            self.instance_hashost_down = true;
                            break;
                        }
                    }
                    self.allowSnapshot(instances);
                    self.allowResize(instances);
                    self.allowHotExtendvDisk(instances);

                    self.allowSetMemory(instances);

                    self.allowAttachVolume(instances);
                    self.allowDetachVolume(instances);

                    self.allowAssFloatingIp(instances);
                    self.allowDisassFloatingIp(instances);

                    self.allowAssNet(instances);
                    self.allowDisassNet(instances);
                    self.allowRebuild(instances);

                    self.allownovnc(instances);
                    self.allowshutoff(instances);
                    self.allowstart(instances);
                    self.allowreboot(instances);
                    self.allowsuspend(instances);
                    self.allowresume(instances);
                    self.allowpause(instances);
                    self.allowunpause(instances);
                    self.allowdelete(instances);
                    self.allowEditSecGroup(instances);
                    self.allowInstanceMonitor(instances);
                    self.allowInstancesEdit(instances);
                };
                //end:jiaozh1:update:2016-11-23:bug:Bugzilla - bug 75710
                scope.filterFacets = [{
                    label: gettext('Name'),
                    name: 'name',
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
                    singleton: true,
                }];

                this.init();

            }
        ])

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
