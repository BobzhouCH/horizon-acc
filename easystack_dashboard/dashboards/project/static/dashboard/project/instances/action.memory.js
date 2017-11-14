(function () {
    'use strict';
    angular.module('hz.dashboard.project.instances')
        .factory('totalMemoryAction', ['horizon.openstack-service-api.nova',
            '$modal',
            'backDrop',
            'horizon.framework.widgets.toast.service','horizon.total.memory.service',
            function (novaAPI, modal, backDrop, toastService, totalMemoryService) {
                var context = {
                    mode: '',
                    submit: gettext('OK'),
                    cancel: gettext('Cancel'),
                };

                function action(scope) {
                    var self = this;
                    var option = {
                        templateUrl: 'total-memory',
                        controller: 'setTotalMemoryAction',
                        backdrop: backDrop,
                        // size:'sm',
                        resolve: {
                            currentItem: function () {
                                return null;
                            },
                            memory: function () {
                                return scope.totalMemory;
                            }
                        },
                        windowClass: 'totalMemoryContent'
                    }
                    self.open = function (selectItem) {
                        console.log(selectItem);
                        if (selectItem.length != 1)
                            return;
                        // var currentMemory = instances[0];
                        // self.instance = angular.copy(instance);
                        option.resolve.currentItem = function () {
                            return selectItem[0]
                        }
                        modal.open(option).result.then(function (memory) {
                            self.submit(selectItem[0], memory);
                        });
                    };

                    self.submit = function (currentItem, memory) {
                         var orginStatus = currentItem.totalMemory.status;
                         currentItem.totalMemory.status = 'suspending';
                         totalMemoryService.setTotalMemory({size: memory.size,hostname:currentItem.id})
                             .success(function (response){
                                if (response.Success) {
                                     self.getMemory(currentItem, memory, 3);
                                } else {
                                    toastService.add('error', gettext('Unable to set memory.'));
                                    currentItem.totalMemory.status = orginStatus;
                                 }
                             })
                             .error(function (message, status_code) {
                                if (status_code == 400) {
                                    toastService.add('error', gettext('Unable to set memory due to:') + message);
                                } else {
                                    toastService.add('error', gettext('Unable to set memory.'));
                                }
                                currentItem.totalMemory.status = orginStatus;
                           });
                    };

                    self.getMemory = function (currentItem, memory, retries) {
                         totalMemoryService.getTotalMemory(currentItem.id)
                            .success(function (response) {
                               if (response.actual){
                                   if ( memory.size === Math.floor(response.actual/1024).toString() ) {
                                        currentItem.totalMemory.status = 'success';
                                        currentItem.totalMemory.size = memory.size;
                                        toastService.add('success', gettext('Successfully set memory.'));
                                   } else if ( retries > 0 ) {
                                        retries -= 1;
                                        currentItem.totalMemory.status = 'suspending';
                                        setTimeout(function () {
                                            self.getMemory(currentItem, memory, retries);
                                        }, 1000);
                                   } else {
                                        toastService.add('error', gettext('The setting operation may fail. Please click refresh button to get the current actual total memory. '));
                                        currentItem.totalMemory.status = 'error';
                                   }
                               } else {
                                   toastService.add('error', gettext('The setting operation may fail. Please click refresh button to get the current actual total memory. '));
                                   currentItem.totalMemory.status = 'error';
                               }
                            })
                            .error(function () {
                                toastService.add('error', gettext('The setting operation may fail. Please click refresh button to get the current actual total memory. '));
                                currentItem.totalMemory.status = 'error';
                            })
                    };
                }

                return action;
            }
        ])

        .controller('setTotalMemoryAction', ['$scope', 'currentItem', 'memory', '$modalInstance',
            function (scope,  currentItem, totalMemory, modalInstance) {
            scope.memory = {};
            scope.inputError = false;
            scope.memory.size = '';
            scope.context = {
                submit: gettext('OK'),
                cancel: gettext('Cancel'),
                title: gettext('Set Actual Total Memory'),
            };


            scope.inputCheck = function () {
                scope.memory.size = scope.memory.size ? scope.memory.size.replace(/[^\d]/g, '') : scope.memory.size;
                //size is null
                if (!scope.memory.size) {
                    return;
                } else {
                    // beyond max ram
                    if (currentItem.flavor.ram && currentItem.flavor.ram < scope.memory.size) {
                        scope.inputError = true
                    } else {
                        scope.inputError = false
                    }
                }
            }

            scope.cancel = function () {
                modalInstance.dismiss('cancel');
            }

            scope.submit = function () {

                // scope.inputCheck();

                if (!scope.inputError) {
                    modalInstance.close(scope.memory);
                }
            }
        }])

})();
