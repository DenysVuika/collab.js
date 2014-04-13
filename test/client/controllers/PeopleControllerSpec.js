'use strict';

describe('controllers', function () {
  describe('PeopleController', function () {

    var ctrl, scope;
    var deferred;
    var peopleService;

    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($rootScope, $controller, $q) {
      peopleService = {
        getPeople: function () {
          deferred = $q.defer();
          return deferred.promise;
        }
      };

      scope = $rootScope.$new();
      ctrl = $controller('PeopleController', {
        $scope: scope,
        peopleService: peopleService
      });
    }));

    it('should request data from people service on init', function () {
      spyOn(peopleService, 'getPeople').and.callThrough();
      scope.init();
      expect(peopleService.getPeople).toHaveBeenCalled();
    });

    it('should load people data', function () {

      var posts = [{},{}];
      scope.init();
      deferred.resolve(posts);
      scope.$root.$digest();

      expect(scope.people.length).toBe(2);
      expect(scope.people).toEqual(posts);
      expect(scope.hasNoPeople).toBeFalsy();
    });
  });
});