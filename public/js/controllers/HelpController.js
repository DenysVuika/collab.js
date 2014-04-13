angular.module('collabjs.controllers')
  .controller('HelpController', ['$scope', '$routeParams', '$sce', 'helpService',
    function ($scope, $routeParams, $sce, helpService) {
      'use strict';

      $scope.content = null;

      $scope.init = function () {
        helpService.getArticle($routeParams.article).then(function (data) {
          $scope.content = $sce.trustAsHtml(data);
        });
      };
    }
  ]);