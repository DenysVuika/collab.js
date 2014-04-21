angular.module('collabjs.controllers')
  .controller('Section1Ctrl', ['$scope', 'isAdmin',
    function ($scope, isAdmin) {
      'use strict';
      // TODO: automate this
      $scope.templateUrl = isAdmin ? '/admin/templates/section1.html' : '/templates/403.html';
    }]);