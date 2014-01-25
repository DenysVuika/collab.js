// root application controller
// scope variables declared here may be accessible to all child controllers
angular.module('collabjs.controllers')
  .controller('AppController', ['$scope',
    function ($scope) {
      'use strict';

      $scope.appName = 'collab.js';

      $scope.init = function (token) {
        $scope.token = token;
      };
    }]);