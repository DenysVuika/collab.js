/*
 Single card controller (used as a child of NewsController)
 */
angular.module('collabjs.controllers')
  .controller('CardController', ['$rootScope', '$scope', '$timeout', '$location', 'authService', 'postsService', 'uiService',
    function ($rootScope, $scope, $timeout, $location, authService, postsService, uiService) {
      'use strict';

      var disableCommentsAction;
      var enableCommentsAction;

      $scope.commentsExpanded = false;
      $scope.comment = '';
      $scope.contextActions = [];

      $scope.init = function (post) {
        $scope.post = post;
        $scope.contextActions = setupContextActions(post);
      };

      $scope.toggleComments = function () {
        if ($scope.commentsExpanded) {
          $scope.commentsExpanded = false;
          uiService.updateLayout();
        } else {
          postsService.loadPostComments($scope.post).then(function () {
            $scope.commentsExpanded = true;
            uiService.updateLayout();
          });
        }
      };

      $scope.postComment = function () {
        if ($scope.post && $scope.post.id && $scope.comment) {
          postsService
            .addComment($scope.post.id, $scope.comment)
            .then(function (comment) {
              var comments = $scope.post.comments || [];
              comments.push(comment);
              $scope.post.comments = comments;

              var count = $scope.post.commentsCount;
              count = count ? count + 1 : 1;
              $scope.post.commentsCount = count;

              $scope.comment = null;
              if ($scope.commentsExpanded) {
                uiService.updateLayout();
              }
            });
        }
      };

      // Context Actions

      function onPostRemoved(postId) {
        // on successful removal update the client side collection
        var toRemove = $scope.posts.filter(function (p) { return p.id === postId; });
        if (toRemove.length > 0) {
          var i = $scope.posts.indexOf(toRemove[0]);
          if (i > -1) {
            $scope.posts.splice(i, 1);
            // TODO: replace with collection watching
            $scope.hasNoPosts = ($scope.posts.length === 0);
          }
        }
      }

      $scope.deleteWallPost = function (post) {
        if (post && post.id) {
          postsService.deleteWallPost(post.id)
            .then(function () {
              onPostRemoved(post.id);
            });
        }
      };

      $scope.deleteNewsPost = function (post) {
        if (post && post.id) {
          postsService.deleteNewsPost(post.id)
            .then(function () {
              onPostRemoved(post.id);
            });
        }
      };

      $scope.showLinkDialog = function (post) {
        var location = $location;
        var port = location.port();
        var link = location.protocol() +
          '://' + location.host() +
          ((port && port !== 80 && port !== 443) ? (':' + port) : '') +
          '/#/posts/' + post.id;

        uiService.showDialog({
          title: 'Link to this post',
          template: '/templates/dlg-post-link.html',
          context: {
            post: post,
            link: link
          },
          submit: {
            title: 'Done'
          },
          cancel: {
            enabled: false
          }
        });
      };

      $scope.$watch("post.readonly", function (newValue) {
        var readonly = newValue ? true : false;
        if (disableCommentsAction) {
          disableCommentsAction.visible = !readonly;
        }
        if (enableCommentsAction) {
          enableCommentsAction.visible = readonly;
        }
      });

      $scope.disableComments = function (post) {
        postsService.lockPost(post.id).then(function () {
          post.readonly = true;
          uiService.updateLayout();
        });
      };

      $scope.enableComments = function (post) {
        postsService.unlockPost(post.id).then(function () {
          post.readonly = false;
          uiService.updateLayout();
        });
      };

      function setupContextActions(post) {
        var actions = [];
        var currentUser = authService.getCurrentUser();

        if (!currentUser || !post || !post.account) {
          return actions;
        }

        var options = $scope.contextMenuOptions || {
          allowMute: true
        };

        var readonly = post.readonly ? true : false;
        var linkToPostAction = { name: 'Link to post', visible: true, invoke: $scope.showLinkDialog };
        disableCommentsAction = { name: 'Disable comments', visible: !readonly, invoke: $scope.disableComments };
        enableCommentsAction = { name: 'Enable comments', visible: readonly, invoke: $scope.enableComments };

        // actions for the owner of the feed
        if (currentUser.account === post.account) {
          actions.push({ name: 'Delete post', visible: true, invoke: $scope.deleteWallPost });
          actions.push(linkToPostAction);
          actions.push(disableCommentsAction);
          actions.push(enableCommentsAction);
        }
        // actions for guests
        else {
          if (options.allowMute) { actions.push({ name: 'Mute post', visible: true, invoke: $scope.deleteNewsPost }); }
          actions.push(linkToPostAction);
          actions.push({ name: '(todo) Report spam or abuse', visible: true, invoke: function () {}});
        }

        return actions;
      }
    }]);