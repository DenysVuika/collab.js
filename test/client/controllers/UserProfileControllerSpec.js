'use strict';

describe('controllers', function () {
  describe('UserProfileController', function () {

    var ctrl, scope;
    var peopleService;
    var $routeParams;

    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($rootScope, $controller) {
      peopleService = {
        getCountryName: function () {},
        canFollow: function () {},
        follow: function() {},
        canUnfollow: function() {},
        unfollow: function() {},
        getFollowingUrl: function() {},
        getFollowersUrl: function() {}
      };

      $routeParams = {};

      scope = $rootScope.$new();
      ctrl = $controller('UserProfileController', {
        $scope: scope,
        peopleService: peopleService
      });
    }));

    it('should wire with people service', function () {
      expect(scope.getCountryName).toBeDefined();
      expect(scope.canFollow).toBeDefined();
      expect(scope.follow).toBeDefined();
      expect(scope.canUnfollow).toBeDefined();
      expect(scope.unfollow).toBeDefined();
      expect(scope.getFollowingUrl).toBeDefined();
      expect(scope.getFollowersUrl).toBeDefined();
    });
  });
});