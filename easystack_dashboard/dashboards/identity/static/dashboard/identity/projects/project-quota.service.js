
(function() {
  'use strict';

angular.module('hz.dashboard.identity.projects')
 .service('projectQuotaService', ['horizon.openstack-service-api.usersettings',
                                  'horizon.openstack-service-api.settings',
                                  'horizon.framework.widgets.toast.service',
                                  'horizon.framework.util.q.extensions',
                                  '$q',
  function(usersettingsAPI, settingsAPI, toastService, qExtenstions, $q) {

    var nova_quota_name = ['ram', 'key_pairs', 'injected_file_content_bytes', 'cores', 'inject_file_path_bytes', 'instances', 'metadata_items',];
    var cinder_quota_name = ['snapshots_hdd', 'snapshots_ssd','snapshots', 'volumes', 'volumes_ssd', 'volumes_hdd', 'gigabytes_ssd','gigabytes_hdd',
                            'gigabytes', 'backups', 'backup_gigabytes'];
    var neutron_quota_name = ['networks', 'security_groups', 'floating_ips', 'subnets', 'routers', 'loadbalancers', 'listeners','healthmonitors', 'pools', 'ports'];
    var manila_quota_name = ['shares', 'share_gigabytes', 'share_snapshots', 'share_snapshot_gigabytes', 'share_networks',];

    var context = {
      success: gettext('Project %s Quota has been updated successfully.')
    };

    var self = this;
    this.getDomainQuota = function(domain_id) {
      return usersettingsAPI.getDomainQuota(domain_id)
      .then(function(response) {
          var data = response.data;
          return data;
        }
      )
    }

    this.getProjectQuota = function(project_id) {
      return usersettingsAPI.getProjectQuota(project_id, {only_quota: true}).then(
        function(response) {
          var data = response.data;
          return data;
        }
      );
    }

    this.initProjectQuota = function(project_quota_items, domain_quota_items) {

      var novaquota = {};
      var cinderquota = {};
      var neutronquota = {};
      var manilaquota = {};
      var domain_quota_map = {};
      if (domain_quota_items) {
          for (var i=0; i<domain_quota_items.length; i++){
            domain_quota_map[domain_quota_items[i]['tenant_mapping_name']] = domain_quota_items[i];
          }
      }

      for(var i=0; i<project_quota_items.length; i++){
        var name = project_quota_items[i]['name'];
        var project_quota = project_quota_items[i]['usage']['quota'] || 0;
        var project_quota_used = project_quota_items[i]['usage']['used'] || 0;
        var domain_quota = -1;
        var domain_quota_used = 0;
        if (domain_quota_items) {
            var domain_quota = domain_quota_map[name] && domain_quota_map[name]['usage']['quota'] || 0;
            var domain_quota_used = domain_quota_map[name] && domain_quota_map[name]['usage']['used'] || 0;
        }

        var item = {
          name : name,
          init : project_quota,
          value : project_quota,
          checked : project_quota==-1 ? true : false,
          min : 0,
          max : 0
        };

        if (domain_quota == -1){
          item['max'] = null;
          item['domain_quota'] = -1;
        } else {
          item['max'] = domain_quota - domain_quota_used + project_quota;
          if (item['max'] < 0) {
            item['max'] = 0;
          }
        }

        if ($.inArray(name, nova_quota_name) != '-1') {
          novaquota[name] = item;
        } else if ($.inArray(name, cinder_quota_name) != '-1') {
          cinderquota[name] = item;
        } else if ($.inArray(name, neutron_quota_name) != '-1') {
          neutronquota[name] = item;
        } else if ($.inArray(name, manila_quota_name) != '-1') {
          manilaquota[name] = item;
        }
      }

      return {
       novaquota : novaquota,
       cinderquota : cinderquota,
       neutronquota : neutronquota,
       manilaquota : manilaquota
      }

    }

    this.getDefaultProjectQuota = function() {
      var list = [];
      list = list.concat(getQuotaItem(nova_quota_name),
                         getQuotaItem(cinder_quota_name),
                         getQuotaItem(neutron_quota_name),
                         getQuotaItem(manila_quota_name)
                         );
      return {items : list};
    }

    function getQuotaItem(quota_names){
      var items = [];
      for (var i=0; i< quota_names.length; i++){
        items.push({
            name : quota_names[i],
            usage :{ quota : 0, usage : 0 }});
      }
      return items;
    }

    function cleanData(obj, srcFields, destFields){
        var retData = {};
        if (!angular.isArray(srcFields)){
            return retData;
        }
        for (var i=0; i<=srcFields.length; i++){
            if (obj[srcFields[i]]) {
                if (destFields && destFields[i]) {
                    retData[destFields[i]] = obj[srcFields[i]].value;
                } else {
                    retData[srcFields[i]] = obj[srcFields[i]].value;
                }
            }
        }
        return retData;
    }

    this.novaclean = function(novaquota) {
        var srcFields = ['key_pairs', 'ram', 'cores', 'instances'];
        return cleanData(novaquota, srcFields);
    };
    this.cinderclean = function(cinderquota) {
        var srcFields = ['volumes', 'snapshots', 'gigabytes', 'backups', 'backup_gigabytes'];
        return cleanData(cinderquota, srcFields);
    };
    this.neutronclean = function(neutronquota) {
        var srcFields = ['routers', 'subnets', 'networks', 'floating_ips', 'security_groups', 'healthmonitors', 'listeners',
                    'loadbalancers', 'pools', 'ports'];
        var destFields = ['router', 'subnet', 'network', 'floatingip', 'security_group', 'healthmonitor', 'listener',
                    'loadbalancer', 'pool', 'port'];
        return cleanData(neutronquota, srcFields, destFields);
    };
    this.manilaclean = function(manilaquota) {
        var srcFields = ['shares', 'share_snapshots', 'share_gigabytes', 'share_networks'];
        var destFields = ['shares', 'snapshots', 'gigabytes', 'share_networks'];
        return cleanData(manilaquota, srcFields, destFields);
    };
    this.toastContext = function(quotatype){
        if(quotatype==='nova'){
          return gettext('RAM')+','+gettext('Cores')+','+gettext('Instances')+','+gettext('Keypairs');
        }else if(quotatype==='cinder'){
          return gettext('Volumes')+','+gettext('Volume Snapshots')+','+gettext('Volume TotalSize');
        }else if(quotatype==='neutron'){
          return gettext('Floating IPs')+','+gettext('Networks')+','+gettext('Subnets')+','+gettext('Routers')+gettext('Security Groups');
        }else if (quotatype==='manila'){
          return gettext('Shared Files')+','+gettext('Shared File Size')+','+gettext('Shared File Snapshots')+','+gettext('Shared File Networks');
        }
    }
    this.manageQuotaServices = function(promiseArr, project, callback){
        var settledPromises = qExtenstions.allSettled(promiseArr);
        settledPromises.then(onSettled);

        function onSettled(data) {
          manageToast(data.pass);
        }
        function manageToast(resolvedList) {
          if(promiseArr.length == resolvedList.length){
            var message = interpolate(context.success, [project.name]);
            toastService.add('success', message);
          }else{
            var toastStr = '';
            resolvedList.forEach(function (item) {
              toastStr = toastStr + self.toastContext(item.context.name);
            });
            toastStr=toastStr +" "+ gettext("items have been updated successfully.");
            //var message = interpolate(toastStr);
            //toastService.add('success', message);
          }
         callback && callback();
        }
    }

  this.updateProjectQuota = function(project, projectQuota, callBack) {
    var cleanedNovaQuota = self.novaclean(projectQuota.novaquota);
    var cleanedCinderQuota = self.cinderclean(projectQuota.cinderquota);
    var cleanedNeutronQuota = self.neutronclean(projectQuota.neutronquota);
    var cleanedManilaQuota = self.manilaclean(projectQuota.manilaquota);

    //several ajax promises defination
    var promiseArr = [];

    //promises resolves
    var novaServicePromise = usersettingsAPI.updatenovaquota(project.id, cleanedNovaQuota);

    var cinderServicePromise = usersettingsAPI.updatecinderquota(project.id, cleanedCinderQuota);

    var neutronServicePromise = usersettingsAPI.updateneutronquota(project.id, cleanedNeutronQuota);

    var manilaSettingPromise = settingsAPI.getSetting('MANILA_ENABLED', false);
    //make the promises as promises arr
    promiseArr.push({promise: novaServicePromise, context: {name:'nova'}});
    promiseArr.push({promise: neutronServicePromise, context: {name:'neutron'}});
    promiseArr.push({promise: cinderServicePromise, context: {name:'cinder'}});

    manilaSettingPromise.then(function (data){
      if(data){
        //manila promise defination
        var manilaServicePromise = usersettingsAPI.updatemanilaquota(project.id, cleanedManilaQuota);
        promiseArr.push({promise: manilaServicePromise, context: {name:'manila'}});
      }
      self.manageQuotaServices(promiseArr, project, callBack);
    });

  };
  }]);

})();