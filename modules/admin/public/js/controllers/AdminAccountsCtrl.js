angular.module('collabjs.controllers')
  .controller('AdminAccountsCtrl', ['$scope', 'adminService', 'isAdmin',
    function ($scope, adminService, isAdmin) {
      'use strict';
      // TODO: automate this
      $scope.templateUrl = isAdmin ? '/admin/templates/accounts.html' : '/templates/403.html';
      $scope.accounts = [];

      $scope.init = function () {
        adminService.getAccounts().then(function (accounts) {
          $scope.accounts = accounts;
        });
      };

    }]);