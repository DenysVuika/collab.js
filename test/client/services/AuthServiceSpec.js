'use strict';

describe('services', function () {
  describe('AuthService', function () {
    beforeEach(module('collabjs.services'));

    var httpBackend;
    var service;
    var successCallback;
    var errorCallback;

    beforeEach(inject(function ($httpBackend, authService) {
      httpBackend = $httpBackend;
      service = authService;
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

    it('should have setCurrentUser function', function () {
      expect(angular.isFunction(service.setCurrentUser)).toBe(true);
    });

    it('should have getCurrentUser function', function () {
      expect(angular.isFunction(service.getCurrentUser)).toBe(true);
    });

    it('should have login function', function () {
      expect(angular.isFunction(service.login)).toBe(true);
    });

    it('should have logout function', function () {
      expect(angular.isFunction(service.logout)).toBe(true);
    });

    it('should set current user directly', function () {
      var user = {};
      service.setCurrentUser(user);
      expect(service.getCurrentUser()).toEqual(user);
    });

    it('should successfully login user', function () {
      var url = '/api/auth/login';
      var data = { username: 'login', password: 'password' };
      httpBackend.expectPOST(url, data).respond(200);

      service
        .login('login', 'password')
        .then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should fail logging in user', function () {
      var url = '/api/auth/login';
      httpBackend.expectPOST(url).respond(500);

      service
        .login('login', 'password')
        .then(successCallback, errorCallback);
      httpBackend.flush();

      expect(successCallback).not.toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalled();
    });

    it('should logout', function () {
      var url = '/api/auth/logout';
      httpBackend.expectPOST(url).respond(200);

      service.logout().then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should fail logging out', function () {
      var url = '/api/auth/logout';
      httpBackend.expectPOST(url).respond(500);

      service
        .logout()
        .then(successCallback, errorCallback);
      httpBackend.flush();

      expect(successCallback).not.toHaveBeenCalled();
      expect(errorCallback).toHaveBeenCalled();
    });
  });
});