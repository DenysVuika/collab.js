'use strict';

describe('controllers', function () {
  describe('PostController', function () {

    var ctrl, scope;
    var deferred;
    var postsService;
    var $routeParams;

    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($rootScope, $controller, $q) {
      postsService = {
        getPostById: function () {
          deferred = $q.defer();
          return deferred.promise;
        }
      };

      $routeParams = {};

      scope = $rootScope.$new();
      ctrl = $controller('PostController', {
        $scope: scope,
        $routeParams: $routeParams,
        postsService: postsService
      });
    }));

    it('should use postsService to fetch post on init', function () {
      spyOn(postsService, 'getPostById').and.callThrough();
      scope.init();
      expect(postsService.getPostById).toHaveBeenCalled();
    });

    it('should use request params when fetching post', function () {
      spyOn(postsService, 'getPostById').and.callThrough();

      $routeParams.postId = 100;
      scope.init();

      expect(postsService.getPostById).toHaveBeenCalledWith(100);
    });

    it('should load post via postsService', function () {
      var post = {};
      scope.init();
      deferred.resolve(post);
      scope.$root.$digest();

      expect(scope.posts.length).toBe(1);
      expect(scope.posts[0]).toEqual(post);
      expect(scope.hasPost).toBe(true);
    });

    it('should display error on post retrieval error', function () {
      scope.init();
      deferred.reject();
      scope.$root.$digest();

      expect(scope.posts.length).toBe(0);
      expect(scope.error).toBe(scope.postNotFoundMsg);
    });

  });
});