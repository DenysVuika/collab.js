angular.module('collabjs.controllers')
  .controller('StatusController', ['$scope', 'postsService',
    function ($scope, postsService) {
      'use strict';
      $scope.content = null;

      $scope.submit = function () {
        if ($scope.content && $scope.content.length > 0) {
          postsService
            .createPost($scope.content)
            .then(function (post) {
              $scope.content = null;
              // access and modify parent scope items
              $scope.posts.push(post);
            });
        }
      };
    }
  ]);