/*
 Single card controller (used as a child of NewsController)
 */
angular.module('collabjs.controllers')
  .controller('CardController', ['$scope', '$timeout', 'postsService',
    function ($scope, $timeout, postsService) {
      'use strict';

      $scope.commentsExpanded = false;
      $scope.comment = '';

      $scope.init = function (post) {
        $scope.post = post;
      };

      $scope.toggleComments = function ($event) {
        if ($scope.commentsExpanded) {
          $scope.commentsExpanded = false;
          updateCardLayout($event.currentTarget);
        } else {
          postsService.loadPostComments($scope.post, function () {
            $scope.commentsExpanded = true;
            updateCardLayout($event.currentTarget);
          });
        }
      };

      // update card layout based on an element inside it
      function updateCardLayout(element) {
        $timeout(function () {
          $(element).parents('.card').trigger('refreshWookmark');
        }, 0);
      }

      $scope.postComment = function ($event) {
        if ($scope.comment && $scope.comment.length > 0) {
          postsService
            .addComment($scope.post.id, $scope.comment)
            .then(function (comment) {
              var comments = $scope.post.comments || [];
              comments.push(comment);
              $scope.post.comments = comments;
              $scope.post.commentsCount++;
              $scope.comment = null;
              updateCardLayout($event.currentTarget);
            });
        }
      };

      $scope.mute = function () {
        if ($scope.post) {
          var postId = $scope.post.id;
          // remove post on server
          postsService.deletePost(postId).then(function () {
            // on successful removal update the client side collection
            var post = $scope.posts.filter(function (p) { return p.id === postId; });
            if (post.length > 0) {
              var i = $scope.posts.indexOf(post[0]);
              if (i > -1) {
                $scope.posts.splice(i, 1);
                // TODO: replace with collection watching
                $scope.hasNoPosts = ($scope.posts.length === 0);
              }
            }
          });
        }
      };
    }]);