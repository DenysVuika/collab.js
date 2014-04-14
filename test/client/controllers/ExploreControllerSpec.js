'use strict';

describe('controllers', function () {
  describe('ExploreController', function () {

    var ctrl, scope;
    var deferred;
    var postsService;
    var $routeParams;

    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($rootScope, $controller, $q) {
      postsService = {
        getPostsByTag: function () {
          deferred = $q.defer();
          return deferred.promise;
        }
      };

      $routeParams = {};

      scope = $rootScope.$new();
      ctrl = $controller('ExploreController', {
        $scope: scope,
        $routeParams: $routeParams,
        postsService: postsService
      });
    }));

    it('does nothing if tag is not provided', function () {
      spyOn(postsService, 'getPostsByTag').and.callThrough();
      scope.init();
      expect(postsService.getPostsByTag.calls.any()).toEqual(false);
    });

    it('should use route params to search posts', function () {
      spyOn(postsService, 'getPostsByTag').and.callThrough();

      var tag = '[tag]';
      $routeParams.tag = tag;
      scope.init();

      expect(postsService.getPostsByTag).toHaveBeenCalledWith(tag);
    });

    it('switches on progress indicator upon searching for posts', function () {
      $routeParams.tag = '[tag]';
      scope.init();

      expect(scope.isLoadingMorePosts).toBe(true);
    });

    it('loads results from posts service search', function () {
      $routeParams.tag = '[tag]';
      var posts = [{},{}];
      scope.init();
      deferred.resolve(posts);
      scope.$root.$digest();

      expect(scope.posts.length).toBe(2);
      expect(scope.posts).toEqual(posts);
    });

    it('switches off progress indicator after getting posts', function () {
      $routeParams.tag = '[tag]';
      scope.init();
      deferred.resolve([]);
      scope.$root.$digest();

      expect(scope.isLoadingMorePosts).toBe(false);
    });

    it('switches off progress indicator on post retrieval error', function () {
      $routeParams.tag = '[tag]';
      scope.init();
      deferred.reject();
      scope.$root.$digest();

      expect(scope.isLoadingMorePosts).toBe(false);
    });
  });
});