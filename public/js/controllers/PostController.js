angular.module('collabjs.controllers')
  .controller('PostController', ['$scope', '$routeParams', 'postsService', 'profileService',
    function ($scope, $routeParams, postsService, profileService) {
      'use strict';

      $scope.postId = $routeParams.postId;
      $scope.post = null;
      $scope.hasPost = false;
      $scope.hasError = false;
      $scope.error = null;

      postsService.getPostById($scope.postId).then(function (data) {
        $scope.post = data;
        $scope.hasPost = (data !== undefined);
      }, function () {
        $scope.error = 'Post not found.';
        $scope.hasError = true;
      });

      $scope.profilePictureUrl = profileService.profilePictureUrl();
      $scope.loadPostComments = postsService.loadPostComments;
    }
  ]);