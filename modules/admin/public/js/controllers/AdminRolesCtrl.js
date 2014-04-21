angular.module('collabjs.controllers')
  .controller('AdminRolesCtrl', ['$scope', 'isAdmin',
    function ($scope, isAdmin) {
      'use strict';
      // TODO: automate this
      $scope.templateUrl = isAdmin ? '/admin/templates/roles.html' : '/templates/403.html';
    }]);