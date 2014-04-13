'use strict';

describe('controllers', function () {
  describe('FollowingController', function () {

    var ctrl, scope;
    var deferred;
    var peopleService;
    var $routeParams;

    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($rootScope, $controller, $q) {
      peopleService = {
        getFollowing: function () {
          deferred = $q.defer();
          return deferred.promise;
        }
      };

      $routeParams = {};

      scope = $rootScope.$new();
      ctrl = $controller('FollowingController', {
        $scope: scope,
        peopleService: peopleService,
        $routeParams: $routeParams
      });
    }));

    it('should request data from people service on init', function () {
      spyOn(peopleService, 'getFollowing').and.callThrough();
      scope.init();
      expect(peopleService.getFollowing).toHaveBeenCalled();
    });

    it('should request people based on route params', function () {
      spyOn(peopleService, 'getFollowing').and.callThrough();

      var account = '[account]';
      $routeParams.account = account;
      scope.init();

      expect(peopleService.getFollowing).toHaveBeenCalledWith(account);
    });

    it('should load people data', function () {
      var data = {
        user: {},
        feed: [{},{}]
      };

      scope.init();
      deferred.resolve(data);
      scope.$root.$digest();

      expect(scope.profile).toEqual(data.user);
      expect(scope.people).toEqual(data.feed);
      expect(scope.people.length).toBe(2);
      expect(scope.hasNoPeople).toBe(false);
    });

  });
});