/* Controls password settings for user Profile */
angular.module('collabjs.controllers')
  .controller('PasswordController', ['$scope', 'accountService',
    function ($scope, accountService) {
      'use strict';

      $scope.pwdOld = '';
      $scope.pwdNew = '';
      $scope.pwdConfirm = '';

      $scope.error = false;
      $scope.info = false;
      $scope.msgSuccess = 'Password has been successfully changed.';

      $scope.dismissError = function () { $scope.error = false; };
      $scope.dismissInfo = function () { $scope.info = false; };

      $scope.reset = function () {
        $scope.pwdOld = '';
        $scope.pwdNew = '';
        $scope.pwdConfirm = '';
      };

      $scope.submit = function () {
        // TODO: add client-side validation (see EmailController for details)

        var settings = {
          pwdOld: $scope.pwdOld,
          pwdNew: $scope.pwdNew,
          pwdConfirm: $scope.pwdConfirm
        };

        accountService
          .changePassword(settings)
          .then(
            // success handler
            function () {
              $scope.info = $scope.msgSuccess;
              $scope.reset();
            },
            // error handler
            function (err) {
              $scope.error = 'Error: ' + err;
              $scope.reset();
            }
        );
      };
    }
  ]);