angular.module('collabjs.controllers')
  .controller('StatusController', ['$scope', 'postsService',
    function ($scope, postsService) {
      'use strict';
      $scope.content = null;

      $scope.submit = function () {
        if ($scope.content) {
          postsService
            .createPost($scope.content)
            .then(function (post) {
              $scope.content = null;
              // access and modify parent scope items
              if ($scope.posts) {
                $scope.posts.push(post);
              }
            });
        }
      };
    }
  ]);