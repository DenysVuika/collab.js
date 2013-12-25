angular.module('collabjs.controllers')
  .controller('HelpController', ['$scope', '$routeParams', 'helpService', '$sce',
    function ($scope, $routeParams, helpService, $sce) {
      'use strict';

      $scope.content = null;

      helpService.getArticle($routeParams.article).then(function (data) {
        //$scope.content = $sce.trustAsHtml(data);
        $scope.content = data;
      });
    }
  ]);