'use strict';

describe('controllers', function () {
  describe('LoginController', function () {

    var ctrl, scope;
    var deferred;
    var authService, location;

    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($q) {
      authService = {
        login: function () {
          deferred = $q.defer();
          return deferred.promise;
        },
        logout: function () {
          deferred = $q.defer();
          return deferred.promise;
        }
      };
    }));

    beforeEach(inject(function ($rootScope, $controller, $location) {
      scope = $rootScope.$new();
      location = $location;
      ctrl = $controller('LoginController', {
        $scope: scope,
        authService: authService,
        $location: location
      });
    }));

    it('reset clears username and password fields', function () {
      scope.username = 'user';
      scope.password = 'password';
      scope.reset();

      expect(scope.username).toBe('');
      expect(scope.password).toBe('');
    });

    it('should use authService when logout is called', function () {
      spyOn(authService, 'logout').and.callThrough();

      scope.logout();

      expect(authService.logout).toHaveBeenCalled();
    });

    it('should change location on logout', function () {
      spyOn(location, 'url').and.callThrough();

      scope.logout();
      deferred.resolve();
      scope.$root.$digest();

      expect(location.url).toHaveBeenCalledWith('/login');
    });

    it('should use authService when login is called', function () {
      spyOn(authService, 'login').and.callThrough();

      scope.username = 'user';
      scope.password = 'password';
      scope.login();

      expect(authService.login).toHaveBeenCalledWith('user', 'password');
    });

    it('should reset form and redirect to news on login', function () {
      spyOn(scope, 'reset').and.callThrough();
      spyOn(location, 'url').and.callThrough();

      scope.login();
      deferred.resolve();
      scope.$root.$digest();

      expect(scope.reset).toHaveBeenCalled();
      expect(location.url).toHaveBeenCalledWith('/news');
    });

    it('should reset form and show error message on login failure', function () {
      spyOn(scope, 'reset').and.callThrough();

      scope.login();
      deferred.reject();
      scope.$root.$digest();

      expect(scope.reset).toHaveBeenCalled();
      expect(scope.error).toBe(scope.loginErrorMsg);
    });
  });
});