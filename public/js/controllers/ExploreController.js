angular.module('collabjs.controllers')
  .controller('ExploreController', ['$scope', '$routeParams', 'postsService',
    function ($scope, $routeParams, postsService) {
      'use strict';

      $scope.posts = [];
      $scope.isLoadingMorePosts = false;

      $scope.init = function () {
        $scope.tag = $routeParams.tag;
        if ($scope.tag) {
          $scope.isLoadingMorePosts = true;
          postsService.getPostsByTag($scope.tag).then(
            // success handler
            function (data) {
              $scope.posts = data || [];
              $scope.isLoadingMorePosts = false;
              // TODO: display some info in case no content was found
            },
            // error handler
            function () {
              // TODO: display error
              $scope.isLoadingMorePosts = false;
            }
          );
        }
      };
    }
  ]);