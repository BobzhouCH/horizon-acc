/**
 * Created by chenkang on 17-3-21.
 */

(function () {
    'use strict';

    angular
        .module('horizon.app')
        .service('horizon.total.memory.service', TotalMemoryService);

    TotalMemoryService.$inject = ['$http','horizon.framework.util.http.service','horizon.framework.widgets.toast.service'];

    function TotalMemoryService($http, apiService,toastService) {

        this.getTotalMemory = function (params) {
            return apiService.get('/api/nova/servers/' + params + '/actual_total_memory')
        };

        this.setTotalMemory = function (params) {
            return apiService.patch("/api/nova/servers/" + params.hostname + "/actual_total_memory", {
                granularity: "MB",
                "size": params.size
            })
        };

    }
}());