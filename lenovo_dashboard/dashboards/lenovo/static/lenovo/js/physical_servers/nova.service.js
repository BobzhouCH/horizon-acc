/**
 * Created by chenkang on 17-3-21.
 */

(function () {
    'use strict';

    angular
        .module('horizon.app')
        .service('horizon.physical.nova.service', NovaService);

    NovaService.$inject = ['horizon.framework.widgets.toast.service', 'horizon.framework.util.http.service'];

    function NovaService(toastService, apiService) {

        this.getKsmInfo = function (params) {
            return apiService.get("/api/ksm/" + renameHostName(params))
                .error(function (data) {
                    toastService.add('error', gettext('Unable to retrieve Ksm records.'));
                });
        };

        this.setKsmStatus = function (params) {
            return apiService.patch("/api/ksm/" + renameHostName(params.hostname), {action: params.enable})
                .error(function (message, status_code) {
                    toastService.add('error', gettext('Unable to set ksm status.'));
                });
        };

        this.getzRamInfo = function (params) {
            return apiService.get("/api/zram/" + renameHostName(params))
                .error(function (data) {
                    toastService.add('error', gettext('Unable to retrieve zram records.'));
                });
        }

        this.setZramStatus = function (params) {
            return apiService.patch("/api/zram/" + renameHostName(params.hostname), {action: params.enable})
                .error(function (message, status_code) {
                    toastService.add('error', gettext('Unable to set zram status.'));
                });
        };

        function renameHostName(params){
            var hostname = "";
            if(params){
                hostname = params.indexOf(".domain.tld") > -1 ? params : params + '.domain.tld';
            }
            return hostname;
        }
    }
}());