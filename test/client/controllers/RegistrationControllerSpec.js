'use strict';

describe('controllers', function () {
  describe('RegistrationController', function () {

    var ctrl, scope;
    var deferred;
    var accountService, location;

    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($rootScope, $controller, $q, $location) {

      accountService = {
        createAccount: function () {
          deferred = $q.defer();
          return deferred.promise;
        }
      };

      location = $location;

      scope = $rootScope.$new();
      ctrl = $controller('RegistrationController', {
        $scope: scope,
        $location: location,
        accountService: accountService
      });
    }));

    it('should call createAccount on accountService when register is called', function () {
      spyOn(accountService, 'createAccount').and.callThrough();

      scope.register();

      expect(accountService.createAccount).toHaveBeenCalled();
    });

    it('resets form and shows error on createAccount failure', function () {
      scope.password = '[password]';
      scope.confirmPassword = '[password]';

      var error = '[error]';
      scope.register();
      deferred.reject(error);
      scope.$root.$digest();

      expect(scope.error).toBe(error);
      expect(scope.password).toBe('');
      expect(scope.confirmPassword).toBe('');
    });

    it('redirects to root upon successful registration', function () {
      spyOn(location, 'path').and.callThrough();

      scope.register();
      deferred.resolve();
      scope.$root.$digest();

      expect(location.path).toHaveBeenCalledWith('/');

    });

  });
});