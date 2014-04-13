'use strict';
describe('controllers', function () {
  describe('AppController', function () {

    var ctrl, scope;

    beforeEach(module('collabjs.controllers'));

    beforeEach(inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();
      ctrl = $controller('AppController', {
        $scope: scope
      });
    }));

    it('should initialize global csrf token', inject(function ($http) {
      var token = '[token]';
      scope.init(token);
      expect($http.defaults.headers.common['x-csrf-token']).toBe(token);
    }));

  });
});
