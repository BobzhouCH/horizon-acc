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
(function() {
  'use strict';

  angular
    .module('horizon.openstack-service-api')
    .service('horizon.openstack-service-api.marathon', MarathonAPI);

  MarathonAPI.$inject = [
    'horizon.framework.util.http.service',
    'horizon.framework.widgets.toast.service',
  ];

  /**
   * @ngdoc service
   * @name horizon.openstack-service-api.nova
   * @description Provides access to Nova APIs.
   */
  function MarathonAPI(apiService, toastService) {
    this.getApps = function() {
      return apiService.get('/api/containers/apps/').error(function() {
        toastService.add('error', gettext('Unable to retrieve apps.'));
      });
    };

    this.getApp = function(clusterId, appId) {
      return apiService.get('/api/containers/clusters/' + clusterId + '/apps/' + appId).error(function() {
        toastService.add('error', gettext('Unable to retrieve app.'));
      });
    };
    this.updateApp = function(clusterId, appId, data) {
      return apiService.patch('/api/containers/clusters/' + clusterId + '/apps/' + appId, data).error(function() {
        toastService.add('error', gettext('Unable to update app.'));
      });
    };
    this.createApp = function(app) {
      return apiService.post('/api/containers/apps/', app).error(function() {
        toastService.add('error', gettext('Unable to create an app.'));
      });
    };

    this.deleteApp = function(apps) {
        return apiService.delete('/api/containers/apps/', apps).error(function() {
            toastService.add('error', gettext('Unable to delete an app.'));
        });
    };

    this.getLabels = function(cluster_id) {
      return apiService.get('/api/containers/labels/').error(function() {
        toastService.add('error', gettext('Unable to retrieve labels.'));
      });
    };

    this.getClusters = function() {
      return apiService.get('/api/containers/clusters/').error(function() {
        toastService.add('error', gettext('Unable to retrieve clusters.'));
      });
    };

    this.getCluster = function(id) {
      return apiService.get('/api/containers/cluster/' + id).error(function() {
        toastService.add('error', gettext('Unable to retrieve the cluster.'));
      });
    };

    this.getClusterMatrics = function(cluster_id) {
      return apiService.get('/api/containers/clusters/' + cluster_id + '/matrics').error(function() {
        toastService.add('error', gettext('Unable to retrieve the cluster matrics.'));
      });
    };
                                                                          
    this.getClusterAppsMatrics = function(cluster_id, app) {
      return apiService.get('/api/containers/clusters/' + cluster_id + '/apps/' + app + '/monitor').error(function() {
        toastService.add('error', gettext('Unable to retrieve the cluster metrics.'));
      });
    };

    this.getAppVersion = function(clusterId, appId) {
      return apiService.get('/api/containers/clusters/' + clusterId + '/apps/' + appId + '/version').error(function() {
        toastService.add('error', gettext('Unable to retrieve app version.'));
      });
    };

    this.getAppInstances = function(clusterId, appId) {
      return apiService.get('/api/containers/clusters/' + clusterId + '/apps/' + appId + '/instances').error(function() {
        toastService.add('error', gettext('Unable to retrieve app instances.'));
      });
    };

    this.updateAppInstances = function(clusterId, appId,insCount) {
      return apiService.get('/api/containers/clusters/' + clusterId + '/apps/' + appId + '/instancesupd/' + insCount).error(function() {
        toastService.add('error', gettext('Unable to retrieve app instances.'));
      });
    };

    this.getAppEvents = function(clusterId, appId) {
      return apiService.get('/api/containers/clusters/' + clusterId + '/apps/' + appId + '/events').error(function() {
        toastService.add('error', gettext('Unable to retrieve app events.'));
      });
    };

    this.getProjects = function() {
      return apiService.get('/api/containers/projects/').error(function() {
        toastService.add('error', gettext('Unable to retrieve projects.'));
      });
    };

    this.getProject = function(projectId) {
      return apiService.get('/api/containers/projects/' + projectId).error(function() {
        toastService.add('error', gettext('Unable to retrieve project: ' + projectId));
      });
    };

    this.updateProject = function(project) {
      return apiService.put('/api/containers/projects/' + project.id, project).error(function() {
        toastService.add('error', gettext('Unable to update project: ' + projectId));
      });
    };

    this.createProject = function(project) {
      return apiService.post('/api/containers/projects/', project).error(function() {
        toastService.add('error', gettext('Unable to create project.'));
      });
    };

    this.getProjectVersion = function(projectId) {
      return apiService.get('/api/containers/projects/' + projectId + '/builds').error(function() {
        toastService.add('error', gettext('Unable to update project: ' + projectId));
      });
    };

    this.deleteProject = function(projects) {
        return apiService.delete('/api/containers/projects/', projects).error(function() {
            toastService.add('error', gettext('Unable to delete projects.'));
        });
    };

    this.buildProject = function(projectId, imageName) {
        return apiService.post('/api/containers/projects/' + projectId + '/builds', {
          'image_name': imageName
        }).error(function() {
            toastService.add('error', gettext('Unable to build project.'));
        });
    };

    this.getClusterApps = function(clusterId) {
      return apiService.get('/api/containers/clusters/' + clusterId + '/apps').error(function() {
        toastService.add('error', gettext('Unable to retrieve apps.'));
      });
    };
    this.getAppLogs = function(data) {
      return apiService.post('/api/containers/es/index',data).error(function() {
        toastService.add('error', gettext('Unable to retrieve app logs.'));
      });
    };
    this.getAppNodes = function(clusterId, appId) {
      return apiService.get('/api/containers/clusters/' + clusterId + '/apps/' + appId + '/appnodes').error(function() {
        toastService.add('error', gettext('Unable to retrieve app nodes.'));
      });
    };
    this.deleteAppVersions = function(clusterId, appId, versionIds) {
      return apiService.delete('/api/containers/clusters/' + clusterId + '/apps/' + appId + '/versions', versionIds).error(function() {
        toastService.add('error', gettext('Unable to delete app version.'));
      });
    };
    this.getAppTasks = function(clusterId, appId) {
      return apiService.get('/api/containers/clusters/' + clusterId + '/apps/' + appId + '/task').error(function() {
        toastService.add('error', gettext('Unable to retrieve app task.'));
      });
    };
    this.getAppTaskAll = function() {
      return apiService.get('/api/containers/clusters/app/task').error(function() {
        toastService.add('error', gettext('Unable to retrieve app task.'));
      });
    };
    this.createAppTask = function(clusterId, appId, task) {
      return apiService.post('/api/containers/clusters/' + clusterId + '/apps/' + appId + '/task', task).error(function() {
        toastService.add('error', gettext('Unable to create app task.'));
      });
    };
    this.deleteAppTask = function(taskId) {
      return apiService.delete('/api/containers/clusters/apps/' + taskId).error(function() {
        toastService.add('error', gettext('Failed to delete app task.'));
      });
    };
    this.updateAppTask = function(taskId, task) {
      return apiService.put('/api/containers/clusters/apps/' + taskId, task).error(function() {
        toastService.add('error', gettext('Failed to update app task.'));
      });
    };
    this.troggleAppTask = function(taskId, data) {
      return apiService.patch('/api/containers/clusters/apps/' + taskId, data).error(function() {
        toastService.add('error', gettext('Failed to troggle app task.'));
      });
    };
    this.getAppLogContext = function(data) {
      return apiService.post('/api/containers/es/context',data).error(function() {
        toastService.add('error', gettext('Unable to retrieve app log context.'));
      });
    };
    this.getAlarmEvents = function(appName) {
      return apiService.get('/api/containers/clusters/' + appName + '/alarm_event').error(function() {
        toastService.add('error', gettext('Unable to retrieve alarm evnets.'));
      });
    };
    this.getAlarmEventAll = function() {
      return apiService.get('/api/containers/clusters/app/alarm_event').error(function() {
        toastService.add('error', gettext('Unable to retrieve alarm evnets.'));
      });
    };
    this.getProjectBuildLog = function(projectId, buildNumber, jobId) {
      return apiService.get('/api/containers/projects/' + projectId + '/builds/' + buildNumber + '/' + jobId + '/logs').error(function() {
        toastService.add('error', gettext('Unable to retrieve alarm evnets.'));
      });
    };
  }
}());
