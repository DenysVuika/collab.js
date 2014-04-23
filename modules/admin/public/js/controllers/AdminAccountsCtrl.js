angular.module('collabjs.controllers')
  .controller('AdminAccountsCtrl', ['$scope', '$q', 'adminService', 'uiService',
    function ($scope, $q, adminService, uiService) {
      'use strict';

      $scope.accounts = [];

      $scope.init = function () {
        adminService.getAccounts().then(function (accounts) {
          $scope.accounts = accounts;
        });
      };

      $scope.deleteAccount = function (account) {
        if (account) {
          uiService.confirmDialog(
            'Are you sure you want to remove account "' + account.account + '"?',
            function () {
              var d = $q.defer();
              adminService
                .deleteAccount(account.account)
                .then(function () {
                  var i = $scope.accounts.indexOf(account);
                  if (i > -1) {
                    $scope.accounts.splice(i, 1);
                  }
                  d.resolve();
                });
              return d.promise;
            }
          );
        }
      };
    }]);