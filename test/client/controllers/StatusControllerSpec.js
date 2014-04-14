'use strict';

describe('controllers', function () {
  describe('RegistrationController', function () {

    var ctrl, scope;
    var deferred;
    var postsService;

    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($rootScope, $controller, $q) {
      postsService = {
        createPost: function () {
          deferred = $q.defer();
          return deferred.promise;
        }
      };

      scope = $rootScope.$new();
      ctrl = $controller('StatusController', {
        $scope: scope,
        postsService: postsService
      });
    }));

    it('submit does nothing when content is not defined', function () {
      spyOn(postsService, 'createPost').and.callThrough();

      scope.submit();

      expect(postsService.createPost.calls.any()).toEqual(false);
    });

    it('should call createPost on posts service when submit is called', function () {
      spyOn(postsService, 'createPost').and.callThrough();

      scope.content = '[content]';
      scope.submit();

      expect(postsService.createPost).toHaveBeenCalledWith(scope.content);
    });

    it('resets content upon successful post', function () {
      scope.content = '[content]';
      scope.submit();
      deferred.resolve();
      scope.$root.$digest();

      expect(scope.content).toBeNull();
    });

    it('pushes new post to the posts collection', function () {
      var post = {};
      scope.posts = [];
      scope.content = '[content]';
      scope.submit();
      deferred.resolve(post);
      scope.$root.$digest();

      expect(scope.posts.length).toBe(1);
      expect(scope.posts[0]).toBe(post);
    });
  });
});