'use strict';

describe('controllers', function () {
  describe('MenuController', function () {

    var ctrl, scope, user;
    var deferred;
    var authService, menuService;

    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($rootScope, $controller, $q) {

      user = null;

      authService = {
        getCurrentUser: function () {
          return user;
        }
      };

      menuService = {
        getMenuItems: function () {
          deferred = $q.defer();
          return deferred.promise;
        }
      };

      scope = $rootScope.$new();
      ctrl = $controller('MenuController', {
        $scope: scope,
        authService: authService,
        menuService: menuService
      });
    }));

    it('should get current user on route change', function () {
      spyOn(authService, 'getCurrentUser').and.callThrough();
      scope.$root.$broadcast('$routeChangeSuccess');
      expect(authService.getCurrentUser).toHaveBeenCalled();
    });

    it('should fetch user properties on route change', function () {
      user = {
        name: '[user]',
        pictureUrl: '[URL]',
        account: '[account]'
      };

      scope.$root.$broadcast('$routeChangeSuccess');

      expect(scope.isAuthenticated).toBe(true);
      expect(scope.userName).toBe(user.name);
      expect(scope.userPictureUrl).toBe(user.pictureUrl);
      expect(scope.userAccount).toBe(user.account);
    });

    it('updates properties if current user was not found', function () {
      scope.$root.$broadcast('$routeChangeSuccess');

      expect(scope.isAuthenticated).toBe(false);
      expect(scope.userName).toBeNull();
    });

    it('should request menu items once current user is fetched', function () {
      spyOn(menuService, 'getMenuItems').and.callThrough();
      user = {};
      var menuItems = [{},{}];

      scope.$root.$broadcast('$routeChangeSuccess');
      deferred.resolve(menuItems);
      scope.$root.$digest();

      expect(menuService.getMenuItems).toHaveBeenCalled();
      expect(scope.items.length).toBe(2);
      expect(scope.items).toBe(menuItems);
    });

  });
});