'use strict';

describe('controllers', function () {
  describe('AccountController', function () {
    beforeEach(module('collabjs.controllers'));

    var ctrl, scope;
    var deferred;
    /*var $httpBackend;*/
    var accountService;


    beforeEach(inject(function ($q) {
      accountService = {
        getAccount: function () {
          deferred = $q.defer();
          return deferred.promise;
        },
        updateAccount: function () {
          deferred = $q.defer();
          return deferred.promise;
        }
      };
    }));

    beforeEach(inject(function($rootScope, $controller/*, _$httpBackend_*/) {
      /*$httpBackend = _$httpBackend_;*/
      scope = $rootScope.$new();
      ctrl = $controller('AccountController', {
        $scope: scope,
        accountService: accountService
      });
    }));

    it('should call getAccount on account service when init is called', function () {
      spyOn(accountService, 'getAccount').and.callThrough();

      scope.init();
      deferred.reject();
      scope.$root.$digest();

      expect(accountService.getAccount).toHaveBeenCalled();
    });

    it('should get account and initialize itself', inject(function ($http) {

      var account = {
        token: 'token',
        avatarServer: 'URL',
        pictureUrl: 'URL',
        name: 'john doe',
        location: 'ua',
        website: 'URL',
        bio: 'some bio'
      };

      scope.init();
      deferred.resolve(account);
      scope.$root.$digest();

      expect($http.defaults.headers.common['x-csrf-token']).toBe(account.token);
      expect(scope.avatarServer).toBe(account.avatarServer);
      expect(scope.pictureUrl).toBe(account.pictureUrl);
      expect(scope.name).toBe(account.name);
      expect(scope.location).toBe(account.location);
      expect(scope.website).toBe(account.website);
      expect(scope.bio).toBe(account.bio);
    }));

    it('should initialize country data', function () {
      expect(scope.countries).toBeDefined();
      expect(scope.countries.length).toBeGreaterThan(0);
    });

    it('should dismiss error', function () {
      scope.error = '[ERROR]';
      scope.dismissError();
      expect(scope.error).toBeFalsy();
    });

    it('should dismiss info', function () {
      scope.info = '[INFO]';
      scope.dismissInfo();
      expect(scope.info).toBeFalsy();
    });

    it('should update account', function () {
      spyOn(accountService, 'updateAccount').and.callThrough();

      scope.submit();
      deferred.resolve();
      scope.$root.$digest();

      expect(accountService.updateAccount).toHaveBeenCalled();
      expect(scope.info).toEqual(scope.updateSuccessMsg);
    });

    it('formatCountry returns empty string when entry is missing', function () {
      var result = scope.formatCountry(null);
      expect(result).toBe('');
    });

    it('formatCountry returns entry text when id is missing', function () {
      var text = 'some text';
      var result = scope.formatCountry({ text: text });
      expect(result).toBe(text);
    });

    it('formatCountry gives formatted output', function () {
      var result = scope.formatCountry({ id: 'UA', text: 'Ukraine' });
      var expected = '<i class="flag-icon-16 flag-ua"></i>Ukraine';
      expect(result).toBe(expected);
    });
  });
});