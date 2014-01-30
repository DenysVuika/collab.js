/*
root application controller
 scope variables declared here may be accessible to all child controllers
*/
angular.module('collabjs.controllers')
  .controller('AppController', ['$scope', '$http',
    function ($scope, $http) {
      'use strict';

      $scope.appName = 'collab.js';
      $scope.appConfig = collabjs.config;

      $scope.init = function (token) {
        // set default csrf token for all requests
        $http.defaults.headers.common['x-csrf-token'] = token;
      };
    }]);