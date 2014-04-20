angular.module('collabjs.services')
  .service('uiService', ['$http', '$compile', '$rootScope',
    function ($http, $compile, $rootScope) {
      'use strict';

      var dialogDefaults = {
        title: 'Dialog',
        template: '',
        context: {},
        submit: {
          enabled: true,
          title: 'OK',
          action: function () {
            return true;
          }
        },
        cancel: {
          enabled: true,
          title: 'Cancel',
          action: function () {
            return true;
          }
        }
      };

      return {
        updateLayout: function () {
          $rootScope.$broadcast('updateLayout@collab.js');
        },
        showDialog: function (options) {
          var opts = angular.extend({}, dialogDefaults, options);
          opts.submit = angular.extend(dialogDefaults.submit, options.submit || {});
          opts.cancel = angular.extend(dialogDefaults.cancel, options.cancel || {});
          var $element;

          var scope = $rootScope.$new(true);
          scope.title = opts.title;
          scope.template = opts.template;

          scope.okButtonText = opts.submit.title;
          scope.cancelButtonText = opts.cancel.title;
          scope.formObject = opts.context;

          $http.get('/templates/form-modal.html')
            .success(function (response) {
              // compile templates/form-modal.html and wrap it in a jQuery object
              $element = $($compile(response)(scope));
              $element.modal('show');
            });

          function processModalResult(result) {
            if ((typeof result === 'object') && (result !== null)) {
              result.success(function () {
                $element.modal('hide');
              });
            } else if (result === false) {
              // noop
              return false;
            } else {
              $element.modal('hide');
            }
          }

          scope.okButton = {
            enabled: opts.submit.enabled,
            title: opts.submit.title,
            // called by form-modal form ng-submit
            action: function () {
              var result = opts.submit.action();
              processModalResult(result);
            }
          };
          scope.cancelButton = {
            enabled: opts.cancel.enabled,
            title: opts.cancel.title,
            // called by form-modal cancel button
            action: function () {
              var result = opts.cancel.action();
              processModalResult(result);
            }
          };
        }
      };
    }]);