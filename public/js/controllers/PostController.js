angular.module('collabjs.controllers')
  .controller('PostController', ['$scope', '$routeParams', 'postsService',
    function ($scope, $routeParams, postsService) {
      'use strict';

      $scope.posts = [];
      $scope.hasPost = false;
      $scope.error = false;
      $scope.postNotFoundMsg = 'Post not found.';

      $scope.init = function () {
        $scope.postId = $routeParams.postId;
        postsService.getPostById($scope.postId).then(
          // success handler
          function (data) {
            $scope.posts = [data];
            $scope.hasPost = ($scope.posts.length > 0);
          },
          // error handler
          function () {
            $scope.error = $scope.postNotFoundMsg;
          }
        );
      };

      // do nothing here
      $scope.loadMorePosts = function () {};
    }
  ]);