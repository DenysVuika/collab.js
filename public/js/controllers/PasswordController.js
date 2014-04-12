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

      $scope.dismissError = function () { $scope.error = false; };
      $scope.dismissInfo = function () { $scope.info = false; };

      function clear() {
        $scope.pwdOld = '';
        $scope.pwdNew = '';
        $scope.pwdConfirm = '';
      }

      $scope.submit = function () {
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
              $scope.info = 'Password has been successfully changed.';
              clear();
            },
            // error handler
            function (err) {
              $scope.error = 'Error: ' + err;
              clear();
            }
        );
      };
    }
  ]);