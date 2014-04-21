angular.module('collabjs.controllers')
  .controller('AdminUsersCtrl', ['$scope', 'isAdmin',
    function ($scope, isAdmin) {
      'use strict';
      // TODO: automate this
      $scope.templateUrl = isAdmin ? '/admin/templates/users.html' : '/templates/403.html';
    }]);