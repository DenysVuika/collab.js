'use strict';

describe('controllers', function () {
  describe('EmailController', function () {

    var ctrl, scope;
    var deferred;
    var accountService;

    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($rootScope, $controller, $q) {
      accountService = {
        changeEmail: function () {
          deferred = $q.defer();
          return deferred.promise;
        },
        getAccount: function () {
          deferred = $q.defer();
          return deferred.promise;
        }
      };

      scope = $rootScope.$new();
      ctrl = $controller('EmailController', {
        $scope: scope,
        accountService: accountService
      });
    }));

    it('should dismiss error message', function () {
      scope.error = '[error]';
      scope.dismissError();
      expect(scope.error).toBe(false);
    });

    it('should dismiss info message', function () {
      scope.info = '[info]';
      scope.dismissInfo();
      expect(scope.info).toBe(false);
    });

    it('gets account from account service on init', function () {
      spyOn(accountService, 'getAccount').and.callThrough();
      scope.init();
      expect(accountService.getAccount).toHaveBeenCalled();
    });

    it('should setup old email on init', function () {
      var account = { email: 'some@email.com' };
      scope.init();
      deferred.resolve(account);
      scope.$root.$digest();

      expect(scope.oldEmail).toBe(account.email);
    });

    it('requires main values to be defined in order to submit', function () {
      scope.submit();
      expect(scope.error).toBe(scope.errInvalidValues);

      scope.oldEmail = '[email]';
      scope.submit();
      expect(scope.error).toBe(scope.errInvalidValues);

      scope.newEmail = '[email]';
      scope.submit();
      expect(scope.error).toBe(scope.errInvalidValues);

      scope.confirmEmail = '[confirm]';
      scope.submit();
      expect(scope.error).not.toBe(scope.errInvalidValues);
    });

    it('requires confirmation match new email value', function () {
      scope.oldEmail = '[old]';
      scope.newEmail = '[new]';
      scope.confirmEmail = '[email]';
      scope.submit();
      expect(scope.error).toBe(scope.errConfirmation);
    });

    it('requires new email to not match old one', function () {
      scope.oldEmail = '[old]';
      scope.newEmail = '[old]';
      scope.confirmEmail = '[old]';
      scope.submit();
      expect(scope.error).toBe(scope.errSameEmail);
    });

    it('should call account service to change email', function () {
      spyOn(accountService, 'changeEmail').and.callThrough();

      scope.oldEmail = '[old]';
      scope.newEmail = '[new]';
      scope.confirmEmail = '[new]';
      scope.submit();

      expect(accountService.changeEmail).toHaveBeenCalledWith('[old]', '[new]');
    });

    it('updates on change success', function () {
      scope.oldEmail = '[old]';
      scope.newEmail = '[new]';
      scope.confirmEmail = '[new]';

      scope.submit();
      deferred.resolve();
      scope.$root.$digest();

      expect(scope.info).toBe(scope.msgSuccess);
      expect(scope.oldEmail).toBe('[new]');
      expect(scope.newEmail).toBe('');
      expect(scope.confirmEmail).toBe('');
    });

    it('updates on change failure', function () {
      scope.oldEmail = '[old]';
      scope.newEmail = '[new]';
      scope.confirmEmail = '[new]';

      scope.submit();
      deferred.reject('[error]');
      scope.$root.$digest();

      expect(scope.error).toBe('Error: [error]');
      expect(scope.oldEmail).toBe('[old]');
      expect(scope.newEmail).toBe('');
      expect(scope.confirmEmail).toBe('');
    });
  });
});