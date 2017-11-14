(function () {
    'use strict';

    angular.module('hz.dashboard.lenovo.upgrade')
    .controller('lenovoUpgradeStartController', [
      '$scope', '$modalInstance',
      function (scope, modalInstance) {
          var self = this;
          scope.server = {};
          scope.fileAction = "unchecked";
          scope.fileSelected = false;
          scope.fileChecked = false;
          scope.fileCheckedResult = false;
          scope.fileCheckedErrMsg = "";
          scope.fileCheckedSuccessMsg = gettext("The upgrade package was validated successfully! File Information as below:");
          scope.fileCheckedVersion = "";
          scope.isChecking = false;
          scope.isUploading = false;
          scope.files = [];

          scope.action = {
              check: function () {
                  self.check();
              },
              submit: function () {
                  self.upload();
              },
              cancel: function () {
                  modalInstance.dismiss('cancel');
              }

          };

          scope.label = {
              title: gettext('Upload A Patch: '),
              form_title: gettext('Upgrade Patch'),
              description: gettext('Description:'),
              des_para: gettext('Upload patch file'),
              upgrade: gettext('Upload'),
              check: gettext('Check'),
              select_file: gettext('Please select the upgrade file'),
              checking: gettext('Checking...Please wait a moment'),
              uploading: gettext('Uploading...Please wait a moment'),
          };

          scope.fileChanged = function (ele) {
              if (ele.files.length == 0) {
                  scope.fileSelected = false;
                  scope.files = ele.files;
                  scope.fileChecked = false;
                  scope.fileAction = "unchecked";
              } else if (scope.files.length == 0) {
                  scope.fileSelected = true;
                  scope.files = ele.files;
                  scope.fileChecked = false;
                  scope.fileAction = "unchecked";
              } else {
                  scope.fileSelected = true;
                  var originFile = scope.files[0];
                  var newFile = ele.files[0];

                  if(originFile.lastModified == newFile.lastModified &&
                      originFile.lastModifiedDate == newFile.lastModifiedDate &&
                      originFile.name == newFile.name &&
                      originFile.size == newFile.size &&
                      originFile.type == newFile.type) {
                      return;
                  }

                  scope.fileChecked = false;
                  scope.fileAction = "unchecked";
              }
              scope.$apply();
          }

          this.check = function () {
              scope.isChecking = true;
              document.form.submit();
              var timer = setInterval(pullCheckResult, 1000 * 2);

              function pullCheckResult() {
                  var uploadFrame = document.getElementById('uploadFrame').contentWindow;
                  var result = uploadFrame.document.body.innerText || uploadFrame.document.body.textContent;
                  if (!result)
                      return;

                  try {
                      var result2 = JSON.parse(result);
                      if (result2.status == "success") {
                          scope.fileCheckedVersion = result2.msg;
                          scope.fileCheckedResult = true;
                      } else {
                          scope.fileCheckedErrMsg = gettext(result2.msg);
                          scope.fileCheckedResult = false;
                      }
                  } catch (e) {
                      scope.fileCheckedErrMsg = gettext(e.message);
                      scope.fileCheckedResult = false;
                  } finally {
                      scope.fileChecked = true;
                      scope.isChecking = false;
                      scope.fileAction = 'checked';
                      uploadFrame.document.body.textContent = "";
                      uploadFrame.document.body.innerText = "";
                      clearInterval(timer);
                      scope.$apply();
                  }
              }
          }

          this.upload = function () {
              scope.isUploading = true;
              document.form.submit();

              var timer = setInterval(pullUpgradeResult, 1000*3);

              function pullUpgradeResult() {
                var uploadFrame = document.getElementById('uploadFrame').contentWindow;
                var result = uploadFrame.document.body.innerText || uploadFrame.document.body.textContent;
                if(!result)
                  return;
                try{
                  var result2 = JSON.parse(result);
                  modalInstance.close(result2);
                } catch (e){
                  modalInstance.dismiss('cancel');
                } finally {
                    scope.isUploading = false;
                }
                clearInterval(timer);
              }
          };
      }
    ]);
})();
