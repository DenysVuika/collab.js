'use strict';

describe('controllers', function () {
  describe('WallController', function () {

    var ctrl, scope;
    var deferred;
    var postsService;
    var $routeParams;


    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($rootScope, $controller, $q) {

      postsService = {
        getWall: function () {
          deferred = $q.defer();
          return deferred.promise;
        }
      };

      $routeParams = {};

      scope = $rootScope.$new();
      ctrl = $controller('WallController', {
        $scope: scope,
        $routeParams: $routeParams,
        postsService: postsService
      });
    }));

    it('should not allow muting posts by default', function () {
      expect(scope.contextMenuOptions.allowMute).toBe(false);
    });

    it('should call getWall on posts service on init', function () {
      spyOn(postsService, 'getWall').and.callThrough();
      scope.init();
      expect(postsService.getWall).toHaveBeenCalled();
    });

    it('should use route params when getting wall', function () {
      spyOn(postsService, 'getWall').and.callThrough();
      $routeParams.account = '[account]';
      scope.init();
      expect(postsService.getWall).toHaveBeenCalledWith('[account]');
    });

    it('should get wall data and init profile with posts', function () {
      var data = {
        user: {},
        feed: [{},{}]
      };

      scope.init();
      deferred.resolve(data);
      scope.$root.$digest();

      expect(scope.profile).toBe(data.user);
      expect(scope.posts).toBe(data.feed);
      expect(scope.posts.length).toBe(2);
      expect(scope.hasNoPosts).toBe(false);
    });

    it('displays error message for posts service error on init', function () {
      scope.init();
      deferred.reject();
      scope.$root.$digest();

      expect(scope.error).toBe(scope.errNotFound);
    });

    it('should not start loading more posts if already in progress', function () {
      spyOn(postsService, 'getWall').and.callThrough();

      scope.isLoadingMorePosts = true;
      scope.loadMorePosts();

      expect(postsService.getWall.calls.any()).toBe(false);
    });

    it('should use account and min post id to load more posts', function () {
      spyOn(postsService, 'getWall').and.callThrough();

      scope.account = '[account]';
      scope.posts = [{id:10}, {id:1}];

      scope.loadMorePosts();
      expect(postsService.getWall).toHaveBeenCalledWith('[account]', 1);
    });

    it('loads new posts and appends to existing collection', function () {
      scope.posts = [{id:10}, {id:1}];
      var post = {id:2};
      scope.loadMorePosts();
      deferred.resolve({feed: [post]});
      scope.$root.$digest();

      expect(scope.posts.length).toBe(3);
      expect(scope.posts[2]).toBe(post);
      expect(scope.isLoadingMorePosts).toBe(false);
      expect(scope.hasNoPosts).toBe(false);
    });
  });
});