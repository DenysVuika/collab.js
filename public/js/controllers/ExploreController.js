angular.module('collabjs.controllers')
  .controller('ExploreController', ['$scope', '$timeout', '$http', '$routeParams', 'postsService',
    function ($scope, $timeout, $http, $routeParams, postsService) {
      'use strict';

      $scope.tag = $routeParams.tag;
      $scope.posts = [];
      $scope.isLoadingMorePosts = false;

      if ($scope.tag) {
        $scope.isLoadingMorePosts = true;
        postsService.getPostsByTag($scope.tag).then(
          function (data) {
            $scope.posts = data || [];
            $scope.isLoadingMorePosts = false;
          }
        );
      }
    }
  ]);