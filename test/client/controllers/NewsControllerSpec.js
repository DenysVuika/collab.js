'use strict';

describe('controllers', function () {
  describe('NewsController', function () {

    var ctrl, scope;
    var deferred;
    var postsService;
    var timeout;

    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($rootScope, $controller, $q, $timeout) {

      var serviceFunc = function () {
        deferred = $q.defer();
        return deferred.promise;
      };

      postsService = {
        getNewsUpdates: serviceFunc,
        getNewsUpdatesCount: serviceFunc,
        getNews: serviceFunc
      };

      timeout = $timeout;
      scope = $rootScope.$new();
      ctrl = $controller('NewsController', {
        $scope: scope,
        postsService: postsService
      });
    }));

    it('calls posts service on init', function () {
      spyOn(postsService, 'getNews').and.callThrough();
      scope.init();
      expect(postsService.getNews).toHaveBeenCalled();
    });

    it('loads news from posts service on init', function () {
      var posts = [{},{}];

      scope.init();
      deferred.resolve(posts);
      scope.$root.$digest();

      expect(scope.posts.length).toBe(2);
      expect(scope.posts).toBe(posts);
      expect(scope.hasNoPosts).toBe(false);
    });

    it('should start update checker on init', function () {
      spyOn(scope, 'checkNewPosts').and.callThrough();
      scope.init();
      expect(scope.checkNewPosts).toHaveBeenCalled();
    });

    it('should call posts service when loading new posts', function () {
      spyOn(postsService, 'getNewsUpdates').and.callThrough();
      scope.loadNewPosts();
      expect(postsService.getNewsUpdates).toHaveBeenCalled();
    });

    it('should use max post id when requesting new posts', function () {
      spyOn(postsService, 'getNewsUpdates').and.callThrough();
      scope.posts = [{id: 1},{id:10}];
      scope.loadNewPosts();
      expect(postsService.getNewsUpdates).toHaveBeenCalledWith(10);
    });

    it('should append new posts to existing collection', function () {
      scope.posts = [{id: 1},{id:10}];
      var newPosts = [{id:11}];

      scope.loadNewPosts();
      deferred.resolve(newPosts);
      scope.$root.$digest();

      expect(scope.posts.length).toBe(3);
      expect(scope.posts[2]).toBe(newPosts[0]);
    });

    it('should reset new posts count on loading new posts', function () {
      scope.newPostsCount = 1;

      scope.loadNewPosts();
      deferred.resolve([]);
      scope.$root.$digest();

      expect(scope.newPostsCount).toBe(0);
    });

    it('should restart updates checker upon loading new posts', function() {
      spyOn(scope, 'checkNewPosts').and.callThrough();

      scope.loadNewPosts();
      deferred.resolve([]);
      scope.$root.$digest();

      expect(scope.checkNewPosts).toHaveBeenCalled();
    });

    it('update checker calls posts service to get posts count', function () {
      spyOn(postsService, 'getNewsUpdatesCount').and.callThrough();
      scope.checkNewPosts();
      timeout.flush();
      expect(postsService.getNewsUpdatesCount).toHaveBeenCalled();
    });

    it('update checker uses max post id to get posts count', function () {
      spyOn(postsService, 'getNewsUpdatesCount').and.callThrough();
      scope.posts = [{id: 1},{id:10}];
      scope.checkNewPosts();
      timeout.flush();
      expect(postsService.getNewsUpdatesCount).toHaveBeenCalledWith(10);
    });

    it('update checker sets post counter', function () {
      scope.checkNewPosts();
      timeout.flush();
      deferred.resolve(2);
      scope.$root.$digest();
      expect(scope.newPostsCount).toBe(2);
    });

    it('update checker restarts itself after getting updates', function () {
      spyOn(scope, 'checkNewPosts').and.callThrough();
      scope.checkNewPosts();
      timeout.flush();
      deferred.resolve(2);
      expect(scope.checkNewPosts).toHaveBeenCalled();
    });

    it('update checker restarts itself after posts service error', function () {
      spyOn(scope, 'checkNewPosts').and.callThrough();
      scope.checkNewPosts();
      timeout.flush();
      deferred.reject('[error]');
      expect(scope.checkNewPosts).toHaveBeenCalled();
    });

    it ('wont load more posts if already loading', function () {
      spyOn(postsService, 'getNews').and.callThrough();
      scope.isLoadingMorePosts = true;
      scope.loadMorePosts();
      expect(postsService.getNews.calls.any()).toBe(false);
    });

    it('should call posts service to load more posts', function () {
      spyOn(postsService, 'getNews').and.callThrough();
      scope.loadMorePosts();
      expect(postsService.getNews).toHaveBeenCalled();
    });

    it('should use min post id to load more posts', function () {
      spyOn(postsService, 'getNews').and.callThrough();
      scope.posts = [{id: 10}, {id:1}];
      scope.loadMorePosts();
      expect(postsService.getNews).toHaveBeenCalledWith(1);
    });

    it('should load more posts and append to existing collection', function () {
      scope.posts = [{id: 10}, {id:1}];
      var post = {id: 2};

      scope.loadMorePosts();
      deferred.resolve([post]);
      scope.$root.$digest();

      expect(scope.posts.length).toBe(3);
      expect(scope.posts[2]).toBe(post);
      expect(scope.isLoadingMorePosts).toBe(false);
      expect(scope.hasNoPosts).toBe(false);
    });

  });
});