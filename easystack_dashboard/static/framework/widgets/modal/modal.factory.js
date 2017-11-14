(function() {
  'use strict';

  /**
   * @ngdoc service
   * @name simpleModalService
   *
   * @description
   * Horizon's wrapper for angular-bootstrap modal service.
   * It should only be use for small confirmation dialogs.
   * @param {object} the object containing title, body, submit, and cancel labels
   * @param {object} the object returned from angular-bootstrap $modal
   *
   * @example:
   *  angular
   *    .controller('modalExampleCtrl', ExampleCtrl);
   *
   *  ExampleCtrl.$inject = [
   *    '$scope',
   *    'horizon.framework.widgets.modal.service'
   *  ];
   *
   *  function ExampleCtrl($scope, simpleModalService) {
   *    var options = {
   *      title: 'Confirm Delete',
   *      body: 'Are you sure you want to delete this item?',
   *      submit: 'Yes',
   *      cancel: 'No'
   *    };
   *
   *    simpleModalService(options).result.then(function() {
   *      // user clicked on submit button
   *      // do something useful here
   *    });
   *  });
   */
  angular
    .module('horizon.framework.widgets.modal')
    .factory('horizon.framework.widgets.modal.service', modalService)
    .factory('horizon.framework.widgets.deleteFormHaveIcon.service',deleteFormHaveIconService);

  modalService.$inject = [
    '$modal',
    'horizon.framework.widgets.basePath',
    'horizon.framework.util.i18n.gettext',
    'backDrop',
    'horizon.framework.widgets.deleteFormHaveIcon.service'
  ];

  deleteFormHaveIconService.$inject = ['horizon.framework.widgets.basePath'];

  function modalService($modal, path, gettext, backDrop,deleteFormHaveIconService) {
    var service = {
      modal: modal
    };
    return service;

    ////////////////////

    function modal(params) {
      if (params && params.title && params.body) {
        var options = {
          controller: 'SimpleModalController',
          templateUrl: path + 'modal/simple-modal.html',
          windowClass: 'deleteListContent',
          backdrop:		backDrop,
          resolve: {
            context: function() {
              return {
                title: params.title,
                body: params.body,
                tips: params.tips,
                disable: params.disabled || false,
                submit: params.submit || gettext('Submit'),
                cancel: params.cancel || gettext('Cancel')
              };
            }
          }
        };
        deleteFormHaveIconService.deleteFormHaveIcon(params,options);
        return $modal.open(options);
      }
    } // end of modalOptions function
  } // end of modalService function

  function deleteFormHaveIconService(path){
    var service = {
      deleteFormHaveIcon: deleteFormHaveIcon
    };
    return service;
    function deleteFormHaveIcon(params,options){
      if (params.imgOwner){
        options.templateUrl = path + 'modal/simple-modal-haveicon.html';
        options.resolve = {
            context: function() {
              return {
                title: params.title,
                body: params.body,
                tips: params.tips,
                names: params.name || null,
                disable: params.disabled || false,
                img_path: (params.imgOwner === 'cssChange' ? params.imgOwner : '/static/dashboard/img/delete-form-icon/' + params.imgOwner +'.png'),
                img_show: (params.imgOwner === 'noicon' ? false : true),
                submit: params.submit || gettext('Submit'),
                cancel: params.cancel || gettext('Cancel')
              };
            }
          }
      }
      return options;
    }
  } // end of deleteFormHaveIconService function
})();
