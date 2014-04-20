'use strict';

describe('services', function () {
  describe('AccountService', function () {
    beforeEach(module('collabjs.services'));

    var httpBackend;
    var service;
    var successCallback;
    var errorCallback;

    beforeEach(inject(function ($httpBackend, accountService) {
      httpBackend = $httpBackend;
      service = accountService;
      successCallback = jasmine.createSpy('success');
      errorCallback = jasmine.createSpy('error');
    }));

    afterEach(function () {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    it('should have account service registered', function () {
      expect(service).not.toEqual(null);
    });

    it('should have createAccount function', function () {
      expect(angular.isFunction(service.createAccount)).toBe(true);
    });

    it('should have getAccount function', function () {
      expect(angular.isFunction(service.getAccount)).toBe(true);
    });

    it('should have updateAccount function', function () {
      expect(angular.isFunction(service.updateAccount)).toBe(true);
    });

    it('should have changePassword function', function () {
      expect(angular.isFunction(service.changePassword)).toBe(true);
    });

    it('should have changeEmail function', function () {
      expect(angular.isFunction(service.changeEmail)).toBe(true);
    });

    it('should trigger success callback on creating account', function () {
      var url = '/api/account/register';
      var data = {
        account: '[account]',
        name: '[name]',
        email: '[email]',
        password: '[password]'
      };
      httpBackend.expectPOST(url, data).respond(200);

      service
        .createAccount('[account]', '[name]', '[email]', '[password]')
        .then(successCallback, errorCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
      expect(errorCallback).not.toHaveBeenCalled();
    });

    it('should trigger error callback on creating account', function () {
      var url = '/api/account/register';
      httpBackend.expectPOST(url).respond(500);

      service
        .createAccount('[account]', '[name]', '[email]', '[password]')
        .then(successCallback, errorCallback);
      httpBackend.flush();

      expect(successCallback).not.toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalled();
    });

    it('should get current user profile', function () {
      var url = '/api/profile';
      httpBackend.expectGET(url).respond(200);

      service.getAccount().then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should update current user profile', function () {
      var url = '/api/profile';
      httpBackend.expectPOST(url).respond(200);

      service.updateAccount(url).then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should change password for current user', function () {
      var url = '/api/profile/password';
      var data = {
        pwdOld: '[old]',
        pwdNew: '[new]',
        pwdConfirm: '[confirm]'
      };
      httpBackend.expectPOST(url, data).respond(200);

      service.changePassword(data).then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should not change password for current user', function () {
      var url = '/api/profile/password';
      httpBackend.expectPOST(url).respond(500);

      service
        .changePassword()
        .then(successCallback, errorCallback);
      httpBackend.flush();

      expect(successCallback).not.toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalled();
    });

    it('should change email address for current user', function () {
      var url = '/api/profile/email';
      var data = {
        oldValue: '[old]',
        newValue: '[new]'
      };
      httpBackend.expectPOST(url, data).respond(200);

      service
        .changeEmail(data.oldValue, data.newValue)
        .then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should not change email address for current user', function () {
      var url = '/api/profile/email';
      httpBackend.expectPOST(url).respond(500);

      service
        .changeEmail('old', 'new')
        .then(successCallback, errorCallback);
      httpBackend.flush();

      expect(successCallback).not.toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalled();
    });

  });
});