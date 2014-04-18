'use strict';

describe('services', function () {
  describe('HelpService', function () {
    beforeEach(module('collabjs.services'));

    var httpBackend;
    var service;
    var successCallback;
    var errorCallback;

    beforeEach(inject(function ($httpBackend, helpService) {
      httpBackend = $httpBackend;
      service = helpService;
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

    it('should have getArticle function', function () {
      expect(angular.isFunction(service.getArticle)).toBe(true);
    });

    it('should request help article by name', function () {
      var url = '/api/help/test';
      httpBackend.expectGET(url).respond(200);

      service.getArticle('test').then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should request default help article', function () {
      var url = '/api/help';
      httpBackend.expectGET(url).respond(200);

      service.getArticle().then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });
  });
});