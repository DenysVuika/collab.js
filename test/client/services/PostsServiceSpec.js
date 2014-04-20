'use strict';

describe('services', function () {
  describe('PostsService', function () {
    beforeEach(module('collabjs.services'));

    var scope;
    var httpBackend;
    var service, sce;
    var successCallback;
    var errorCallback;

    beforeEach(inject(function ($rootScope, $httpBackend, $sce, postsService) {
      scope = $rootScope;
      httpBackend = $httpBackend;
      sce = $sce;
      service = postsService;
      successCallback = jasmine.createSpy('success');
      errorCallback = jasmine.createSpy('error');
    }));

    afterEach(function () {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it('should have account service registered', function () {
      expect(service).not.toEqual(null);
    });

    it('should have primary api', function () {
      expect(angular.isFunction(service.getNews)).toBe(true);
      expect(angular.isFunction(service.getNewsUpdatesCount)).toBe(true);
      expect(angular.isFunction(service.getNewsUpdates)).toBe(true);
      expect(angular.isFunction(service.getWall)).toBe(true);
      expect(angular.isFunction(service.getPostById)).toBe(true);
      expect(angular.isFunction(service.getPostsByTag)).toBe(true);
      expect(angular.isFunction(service.getPostComments)).toBe(true);
      expect(angular.isFunction(service.createPost)).toBe(true);
      expect(angular.isFunction(service.addComment)).toBe(true);
      expect(angular.isFunction(service.deleteNewsPost)).toBe(true);
      expect(angular.isFunction(service.deleteWallPost)).toBe(true);
      expect(angular.isFunction(service.loadPostComments)).toBe(true);
      expect(angular.isFunction(service.lockPost)).toBe(true);
      expect(angular.isFunction(service.unlockPost)).toBe(true);
      expect(angular.isFunction(service.addLike)).toBe(true);
      expect(angular.isFunction(service.removeLike)).toBe(true);
    });

    it('should get news', function () {
      var url = '/api/news';
      var requestHeaders;
      httpBackend.expectGET(url).respond(function (method, url, data, headers) {
        requestHeaders = headers;
        return [200];
      });

      service.getNews(1);
      httpBackend.flush();

      expect(requestHeaders['last-known-id']).toBe(1);
    });

    it('should get count of news updates', function () {
      var url = '/api/news';
      var requestHeaders;
      httpBackend.expectGET(url).respond(function (method, url, data, headers) {
        requestHeaders = headers;
        return [200, { posts: [] }];
      });

      service.getNewsUpdatesCount(1).then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
      expect(requestHeaders['last-known-id']).toBe(1);
      expect(requestHeaders['retrieve-mode']).toBe('count-updates');
    });

    it('should return zero for news updates count', function () {
      var url = '/api/news';
      httpBackend.expectGET(url).respond(500);

      var count;
      service.getNewsUpdatesCount(1).then(function (c) {
        count = c;
      });
      httpBackend.flush();
      expect(count).toBe(0);
    });

    it('should get news updates', function () {
      var url = '/api/news';
      var requestHeaders;
      httpBackend.expectGET(url).respond(function (method, url, data, headers) {
        requestHeaders = headers;
        return [200, []];
      });

      service.getNewsUpdates(2).then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
      expect(requestHeaders['last-known-id']).toBe(2);
      expect(requestHeaders['retrieve-mode']).toBe('get-updates');
    });

    it('should get wall for account', function () {
      var url = '/api/u/johndoe/posts';
      var requestHeaders;
      httpBackend.expectGET(url).respond(function (method, url, data, headers) {
        requestHeaders = headers;
        return [200, []];
      });

      service.getWall('johndoe', 3).then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
      expect(requestHeaders['last-known-id']).toBe(3);
    });

    it('should not get the wall on service error', function () {
      httpBackend.expectGET().respond(500);

      service.getWall('johndoe', 3).then(successCallback, errorCallback);
      httpBackend.flush();

      expect(successCallback).not.toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalled();
    });

    it('should get post by id', function () {
      var url = '/api/posts/2';
      httpBackend.expectGET(url).respond(200);

      service.getPostById(2).then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should not get post by id on service error', function () {
      var url = '/api/posts/2';
      httpBackend.expectGET(url).respond(500);

      service.getPostById(2).then(successCallback, errorCallback);
      httpBackend.flush();

      expect(successCallback).not.toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalled();
    });

    it('should get posts by tag', function () {
      var url = '/api/explore/tag';
      var requestHeaders;
      httpBackend.expectGET(url).respond(function (method, url, data, headers) {
        requestHeaders = headers;
        return [200, []];
      });

      service.getPostsByTag('tag', 2).then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
      expect(requestHeaders['last-known-id']).toBe(2);
    });

    it('should get post comments', function () {
      var url = '/api/posts/2/comments';
      httpBackend.expectGET(url).respond(200);

      service.getPostComments(2).then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should create post', function () {
      var url = '/api/u/posts';
      httpBackend.expectPOST(url, { content: '[content]' }).respond(200);

      service.createPost('[content]').then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should add comment for post', function () {
      var url = '/api/posts/1/comments';
      httpBackend.expectPOST(url, { content: '[comment]' }).respond(200);

      service.addComment(1, '[comment]').then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should delete news post', function () {
      var url = '/api/news/2';
      httpBackend.expectDELETE(url).respond(200);

      service.deleteNewsPost(2).then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should delete wall post', function () {
      var url = '/api/posts/1';
      httpBackend.expectDELETE(url).respond(200);

      service.deleteWallPost(1).then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should load comments for a post', function () {
      var url = '/api/posts/2/comments';
      httpBackend.expectGET(url).respond(200);

      service.loadPostComments({id: 2}).then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should not load comments when post id is missing', function () {
      service.loadPostComments({}).then(successCallback, errorCallback);
      scope.$digest();

      expect(successCallback).not.toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalled();
    });

    it('should lock the post', function () {
      var url = '/api/posts/2/lock';
      httpBackend.expectPOST(url).respond(200);

      service.lockPost(2).then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should unlock the post', function () {
      var url = '/api/posts/2/unlock';
      httpBackend.expectPOST(url).respond(200);

      service.unlockPost(2).then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should add like for the post', function () {
      var url = '/api/posts/1/like';
      httpBackend.expectPOST(url).respond(200);

      service.addLike(1).then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should remove like from the post', function () {
      var url = '/api/posts/1/like';
      httpBackend.expectDELETE(url).respond(200);

      service.removeLike(1).then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should process html content', function () {
      var item = { content: 'post' };
      spyOn(sce, 'trustAsHtml').and.callThrough();

      var result = service.processHtmlContent(item);

      expect(result).not.toBeNull();
      expect(result.content).toBe(item.content);
      expect(result.html).not.toBeUndefined();
      expect(sce.trustAsHtml).toHaveBeenCalled();
    });
  });
});