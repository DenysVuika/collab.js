angular.module('collabjs.controllers')
  .controller('PostController', ['$scope', '$routeParams', 'postsService',
    function ($scope, $routeParams, postsService) {
      'use strict';

      $scope.postId = $routeParams.postId;
      $scope.posts = [];
      $scope.hasPost = false;
      $scope.hasError = false;
      $scope.error = null;

      postsService.getPostById($scope.postId).then(function (data) {
        $scope.posts = [data];
        $scope.hasPost = ($scope.posts.length > 0);
      }, function () {
        $scope.error = 'Post not found.';
        $scope.hasError = true;
      });

      // do nothing here
      $scope.loadMorePosts = function () {};
    }
  ]);