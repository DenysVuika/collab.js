'use strict';

describe('services', function () {
  describe('PeopleService', function () {
    beforeEach(module('collabjs.services'));

    var httpBackend;
    var service;
    var successCallback;
    var errorCallback;

    beforeEach(inject(function ($httpBackend, peopleService) {
      httpBackend = $httpBackend;
      service = peopleService;
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

    it('should have primary api', function () {
      expect(angular.isFunction(service.getPeople)).toBe(true);
      expect(angular.isFunction(service.getFollowing)).toBe(true);
      expect(angular.isFunction(service.getFollowers)).toBe(true);
      expect(angular.isFunction(service.canFollow)).toBe(true);
      expect(angular.isFunction(service.getCountryName)).toBe(true);
      expect(angular.isFunction(service.getFollowingUrl)).toBe(true);
      expect(angular.isFunction(service.getFollowersUrl)).toBe(true);
      expect(angular.isFunction(service.follow)).toBe(true);
      expect(angular.isFunction(service.unfollow)).toBe(true);
    });

    it('should retrieve people from server', function () {
      var url = '/api/people';
      httpBackend.expectGET(url).respond(200);

      service.getPeople().then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should retrieve following by account', function () {
      var url = '/api/u/johndoe/following';
      httpBackend.expectGET(url).respond(200);

      service.getFollowing('johndoe').then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should retrieve followers by account', function () {
      var url = '/api/u/johndoe/followers';
      httpBackend.expectGET(url).respond(url);

      service.getFollowers('johndoe').then(successCallback);
      httpBackend.flush();

      expect(successCallback).toHaveBeenCalled();
    });

    it('should allow following profile', function () {
      var profile = { isFollowed: false, isOwnProfile: false };
      expect(service.canFollow(profile)).toBe(true);
    });

    it('should not allow following profile', function () {
      var profile = { isFollowed: true, isOwnProfile: false };
      expect(service.canFollow(profile)).toBe(false);
    });

    it('should not allow following own profile', function () {
      var profile = { isFollowed: false, isOwnProfile: true };
      expect(service.canFollow(profile)).toBe(false);
    });

    it('should allow unfollowing profile', function () {
      var profile = { isFollowed: true, isOwnProfile: false };
      expect(service.canUnfollow(profile)).toBe(true);
    });

    it('should not allow unfollowing profile', function () {
      var profile = { isFollowed: false, isOwnProfile: false };
      expect(service.canUnfollow(profile)).toBe(false);
    });

    it('should not allow unfollowing own profile', function () {
      var profile = { isFollowed: true, isOwnProfile: true };
      expect(service.canUnfollow(profile)).toBe(false);
    });

    it('should get country name', function () {
      var profile = { location: 'ua' };
      expect(service.getCountryName(profile)).toBe('Ukraine');
    });

    it('should not get country name', function () {
      expect(service.getCountryName({})).toBe('');
      expect(service.getCountryName({location: ''})).toBe('');
    });

    it('should get following url', function () {
      var profile = { account: 'johndoe' };
      var expectedUrl = '/#/people/johndoe/following';
      expect(service.getFollowingUrl(profile)).toBe(expectedUrl);
    });

    it('should not get following url if profile is not defined', function () {
      expect(service.getFollowingUrl(null)).toBeNull();
    });

    it('should not get following url if profile account is missing', function () {
      var profile = {};
      expect(service.getFollowingUrl(profile)).toBeNull();
    });

    it('should get followers url', function () {
      var profile = { account: 'johndoe' };
      var expectedUrl = '/#/people/johndoe/followers';
      expect(service.getFollowersUrl(profile)).toBe(expectedUrl);
    });

    it('should not get followers url if profile is not defined', function () {
      expect(service.getFollowersUrl(null)).toBeNull();
    });

    it('should not get followers url if profile account is missing', function () {
      var profile = {};
      expect(service.getFollowersUrl(profile)).toBeNull();
    });

    it('should follow profile', function () {
      var profile = { account: 'johndoe', isFollowed: false };
      var url = '/api/u/johndoe/follow';
      httpBackend.expectPOST(url).respond(200);

      service.follow(profile);
      httpBackend.flush();

      expect(profile.isFollowed).toBe(true);
    });

    it('should unfollow profile', function () {
      var profile = { account: 'johndoe', isFollowed: true };
      var url = '/api/u/johndoe/unfollow';
      httpBackend.expectPOST(url).respond(200);

      service.unfollow(profile);
      httpBackend.flush();

      expect(profile.isFollowed).toBe(false);
    });

  });
});