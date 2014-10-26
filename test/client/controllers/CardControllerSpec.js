'use strict';

describe('controllers', function () {
  describe('CardController', function () {

    var ctrl, scope, user;
    var deferred;
    var authService, postsService, uiService;

    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($rootScope, $controller, $q) {
      user = null;

      authService = {
        getCurrentUser: function () {
          return user;
        }
      };

      function deferredFunc () {
        deferred = $q.defer();
        return deferred.promise;
      }

      postsService = {
        loadPostComments: deferredFunc,
        addComment: deferredFunc,
        deleteWallPost: deferredFunc,
        deleteNewsPost: deferredFunc,
        lockPost: deferredFunc,
        unlockPost: deferredFunc,
        addLike: deferredFunc,
        removeLike: deferredFunc
      };

      uiService = {
        updateLayout: function () {},
        showDialog: function () {},
        confirmDialog: function (msg, callback) { callback(); }
      };

      scope = $rootScope.$new();
      ctrl = $controller('CardController', {
        $scope: scope,
        authService: authService,
        postsService: postsService,
        uiService: uiService
      });
    }));

    it('should init post value', function () {
      var post = {};
      scope.init(post);
      expect(scope.post).toBe(post);
    });

    it('should not setup context actions if user is not logged in', function () {
      scope.init();
      scope.$root.$digest();
      expect(scope.contextActions.length).toBe(0);
    });

    it('should setup context actions on init', function () {
      user = {};
      var post = { account: '[account]' };

      scope.init(post);

      expect(scope.contextActions.length).toBeGreaterThan(0);
    });

    it('should allow removing post for the owner', function () {
      user = { account: '[account]' };
      var post = { account: '[account]' };

      scope.init(post);

      expect(scope.contextActions.length).toBeGreaterThan(0);
      expect(scope.contextActions[0].name).toBe('Delete post');
    });

    it('toggling comments should hide comments and update layout', function () {
      spyOn(uiService, 'updateLayout').and.callThrough();

      scope.commentsExpanded = true;
      scope.toggleComments();

      expect(scope.commentsExpanded).toBe(false);
      expect(uiService.updateLayout).toHaveBeenCalled();
    });

    it('toggling comments should use posts service to get more comments', function () {
      spyOn(postsService, 'loadPostComments').and.callThrough();

      scope.toggleComments();
      expect(postsService.loadPostComments).toHaveBeenCalled();
    });

    it('toggling comments should show comments and update layout', function () {
      spyOn(uiService, 'updateLayout').and.callThrough();

      scope.commentsExpanded = false;
      scope.toggleComments();
      deferred.resolve();
      scope.$root.$digest();

      expect(scope.commentsExpanded).toBe(true);
      expect(uiService.updateLayout).toHaveBeenCalled();
    });

    it('posting comment requires post and comment content', function () {
      spyOn(postsService, 'addComment').and.callThrough();

      // simulate post is not provided
      scope.post = null;
      scope.postComment();
      expect(postsService.addComment.calls.any()).toBe(false);

      // simulate there is a post but comment is not provided
      scope.post = {id: 1};
      scope.postComment();
      expect(postsService.addComment.calls.any()).toBe(false);

      // simulate all the content is provided
      scope.comment = '[comment]';
      scope.postComment();
      expect(postsService.addComment.calls.any()).toBe(true);
    });

    it('should use posts service to post comment', function () {
      spyOn(postsService, 'addComment').and.callThrough();
      scope.post = { id: 1 };
      scope.comment = '[comment]';
      scope.postComment();
      expect(postsService.addComment).toHaveBeenCalled();
    });

    it('posting comment should use post id and content with posts service', function () {
      spyOn(postsService, 'addComment').and.callThrough();
      scope.post = { id: 1 };
      scope.comment = '[comment]';
      scope.postComment();
      expect(postsService.addComment).toHaveBeenCalledWith(1, '[comment]');
    });

    it('should post new comment and append it to the existing collection', function () {
      scope.post = { id: 1 };
      scope.comment = '[comment]';

      var comment = { id: 10 };
      scope.postComment();
      deferred.resolve(comment);
      scope.$root.$digest();

      expect(scope.post.comments.length).toBe(1);
      expect(scope.post.commentsCount).toBe(1);
      expect(scope.post.comments[0]).toBe(comment);
      expect(scope.comment).toBeNull();
    });

    it('should increase comments counter for the post', function () {
      scope.post = { id: 1 };

      scope.comment = '[comment]';
      scope.postComment();
      deferred.resolve({});
      scope.$root.$digest();

      expect(scope.post.comments.length).toBe(1);
      expect(scope.post.commentsCount).toBe(1);

      scope.comment = '[comment]';
      scope.postComment();
      deferred.resolve({});
      scope.$root.$digest();

      expect(scope.post.comments.length).toBe(2);
      expect(scope.post.commentsCount).toBe(2);
    });

    it('should post new comment and update layout if comments are expanded', function () {
      spyOn(uiService, 'updateLayout').and.callThrough();

      scope.post = { id: 1 };
      scope.comment = '[comment]';
      scope.commentsExpanded = true;

      scope.postComment();
      deferred.resolve({});
      scope.$root.$digest();

      expect(uiService.updateLayout).toHaveBeenCalled();
    });

    it('should post new comment and do not update layout if comments are collapsed', function () {
      spyOn(uiService, 'updateLayout').and.callThrough();

      scope.post = { id: 1 };
      scope.comment = '[comment]';
      scope.commentsExpanded = false;

      scope.postComment();
      deferred.resolve({});
      scope.$root.$digest();

      expect(uiService.updateLayout.calls.any()).toBe(false);
    });

    it('should use posts service to delete wall post', function () {
      spyOn(uiService, 'confirmDialog').and.callThrough();
      spyOn(postsService, 'deleteWallPost').and.callThrough();

      scope.deleteWallPost({id:1});

      expect(uiService.confirmDialog).toHaveBeenCalled();
      expect(postsService.deleteWallPost).toHaveBeenCalledWith(1);
    });

    it('requires post id to delete wall post', function () {
      spyOn(postsService, 'deleteWallPost').and.callThrough();

      scope.deleteWallPost(null);
      expect(postsService.deleteWallPost.calls.any()).toBe(false);

      scope.deleteWallPost({});
      expect(postsService.deleteWallPost.calls.any()).toBe(false);

      scope.deleteWallPost({id:1});
      expect(postsService.deleteWallPost.calls.any()).toBe(true);
    });

    it('removes local post after having removed it from the wall', function () {
      scope.posts = [ {id:1}, {id:2} ];

      scope.deleteWallPost(scope.posts[0]);
      deferred.resolve();
      scope.$root.$digest();

      expect(scope.posts.length).toBe(1);
      expect(scope.posts[0].id).toBe(2);
    });

    it('removes last post and updates corresponding flags', function () {
      scope.posts = [ {id:1} ];

      scope.deleteWallPost(scope.posts[0]);
      deferred.resolve();
      scope.$root.$digest();

      expect(scope.posts.length).toBe(0);
      expect(scope.hasNoPosts).toBe(true);
    });

    it('should use posts service to remove news post', function () {
      spyOn(postsService, 'deleteNewsPost').and.callThrough();

      scope.posts = [ {id:1} ];
      scope.deleteNewsPost(scope.posts[0]);
      deferred.resolve();
      scope.$root.$digest();

      expect(postsService.deleteNewsPost).toHaveBeenCalled();
    });

    it('should use ui service to show link dialog', function () {
      spyOn(uiService, 'showDialog').and.callThrough();

      scope.showLinkDialog({id:1});
      expect(uiService.showDialog).toHaveBeenCalled();
    });

    it('uses posts service to lock the post', function () {
      spyOn(postsService, 'lockPost').and.callThrough();

      scope.post = { id:1 };
      scope.disableComments(scope.post);

      expect(postsService.lockPost).toHaveBeenCalled();
    });

    it('should update layout after locking the post', function () {
      spyOn(uiService, 'updateLayout').and.callThrough();

      scope.post = { id:1 };
      scope.disableComments(scope.post);
      deferred.resolve();
      scope.$root.$digest();

      expect(uiService.updateLayout).toHaveBeenCalled();
      expect(scope.post.readonly).toBe(true);
    });

    it('should use posts service to unlock the post', function () {
      spyOn(postsService, 'unlockPost').and.callThrough();

      scope.post = {id:1};
      scope.enableComments(scope.post);

      expect(postsService.unlockPost).toHaveBeenCalled();
    });

    it('should update layout after unlocking the post', function () {
      spyOn(uiService, 'updateLayout').and.callThrough();

      scope.post = { id:1 };
      scope.enableComments(scope.post);
      deferred.resolve();
      scope.$root.$digest();

      expect(uiService.updateLayout).toHaveBeenCalled();
      expect(scope.post.readonly).toBe(false);
    });

    it('watches readonly state of the post and updates comments action', function () {
      user = { account: '[account]' };
      var post = { id: 1, account: '[account]' };
      scope.init(post);

      var disable = scope.contextActions.filter(function (a) { return a.name === 'Disable comments'; })[0];
      var enable = scope.contextActions.filter(function (a) { return a.name === 'Enable comments'; })[0];

      post.readonly = true;
      scope.$apply();

      expect(disable.visible).toBe(false);
      expect(enable.visible).toBe(true);

      post.readonly = false;
      scope.$apply();

      expect(disable.visible).toBe(true);
      expect(enable.visible).toBe(false);
    });

    it('should add like and update local post', function () {
      spyOn(postsService, 'addLike').and.callThrough();
      var post = { id:1, liked:false, likesCount: 1 };
      scope.post = post;

      scope.toggleLike();
      deferred.resolve();
      scope.$root.$digest();

      expect(postsService.addLike).toHaveBeenCalledWith(1);
      expect(post.liked).toBe(true);
      expect(post.likesCount).toBe(2);
    });

    it('should remove like and update local post', function () {
      spyOn(postsService, 'removeLike').and.callThrough();
      var post = { id:1, liked:true, likesCount: 2 };
      scope.post = post;

      scope.toggleLike();
      deferred.resolve();
      scope.$root.$digest();

      expect(postsService.removeLike).toHaveBeenCalledWith(1);
      expect(post.liked).toBe(false);
      expect(post.likesCount).toBe(1);
    });
  });
});