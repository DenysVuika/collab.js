'use strict';

describe('controllers', function () {
  describe('PasswordController', function () {

    var ctrl, scope;
    var deferred;
    var accountService;

    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($rootScope, $controller, $q) {
      accountService = {
        changePassword: function () {
          deferred = $q.defer();
          return deferred.promise;
        }
      };

      scope = $rootScope.$new();
      ctrl = $controller('PasswordController', {
        $scope: scope,
        accountService: accountService
      });
    }));

    it('should dismiss error message', function () {
      scope.error = '[error]';
      scope.dismissError();
      expect(scope.error).toBeFalsy();
    });

    it('should dismiss info message', function () {
      scope.info = '[info]';
      scope.dismissInfo();
      expect(scope.info).toBeFalsy();
    });

    it('should reset form', function () {
      scope.pwdOld = '[old]';
      scope.pwdNew = '[new]';
      scope.pwdConfirm = '[confirm]';

      scope.reset();
      expect(scope.pwdOld).toBe('');
      expect(scope.pwdNew).toBe('');
      expect(scope.pwdConfirm).toBe('');
    });

    it('calls account service to change the password on submit', function () {
      spyOn(accountService, 'changePassword').and.callThrough();

      scope.pwdOld = '[old]';
      scope.pwdNew = '[new]';
      scope.pwdConfirm = '[new]';

      scope.submit();

      expect(accountService.changePassword).toHaveBeenCalledWith({
        pwdOld: '[old]',
        pwdNew: '[new]',
        pwdConfirm: '[new]'
      });
    });

    it('shows info message and resets form on password change success', function () {
      spyOn(scope, 'reset').and.callThrough();

      scope.submit();
      deferred.resolve();
      scope.$root.$digest();

      expect(scope.info).toBe(scope.msgSuccess);
      expect(scope.reset).toHaveBeenCalled();
    });

    it('shows error message and resets form on password change failure', function () {
      spyOn(scope, 'reset').and.callThrough();

      scope.submit();
      deferred.reject('[error]');
      scope.$root.$digest();

      expect(scope.error).toBe('Error: [error]');
      expect(scope.reset).toHaveBeenCalled();
    });

  });
});