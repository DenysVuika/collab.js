// TODO: to be deprecated in favor of CardController implementation
angular.module('collabjs.controllers')
  .controller('CommentController', ['$scope', 'postsService',
    function ($scope, postsService) {
      'use strict';
      $scope.content = '';

      $scope.submit = function () {
        if ($scope.token && $scope.content && $scope.content.length > 0) {
          postsService
            .addComment($scope.token, $scope.post.id, $scope.content)
            .then(function (comment) {
              var comments = $scope.post.comments || [];
              comments.push(comment);
              $scope.post.comments = comments;
              $scope.post.commentsCount++;
              $scope.content = null;
            });
        }
      };
    }
  ]);
