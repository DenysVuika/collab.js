'use strict';

describe('services', function () {
  describe('MenuService', function () {
    beforeEach(module('collabjs.services'));

    var scope;
    var httpBackend;
    var service, auth;
    var successCallback;
    var errorCallback;

    beforeEach(inject(function ($rootScope, $httpBackend, menuService, authService) {
      scope = $rootScope;
      httpBackend = $httpBackend;
      service = menuService;
      auth = authService;
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
      expect(angular.isFunction(service.isItemAllowed)).toBe(true);
      expect(angular.isFunction(service.getMenuItems)).toBe(true);
      expect(angular.isFunction(service.addMenuItems)).toBe(true);
    });

    it('should allow menu item if no roles provided', function () {
      var itemRoles = [], userRoles = [];
      expect(service.isItemAllowed(itemRoles, userRoles)).toBe(true);
    });

    it('should not allow menu item if user has no roles', function () {
      var itemRoles = ['role'], userRoles = [];
      expect(service.isItemAllowed(itemRoles, userRoles)).toBe(false);
    });

    it('should allow menu item if any roles match', function () {
      var itemRoles = ['role1', 'role2'], userRoles = ['role2'];
      expect(service.isItemAllowed(itemRoles, userRoles)).toBe(true);
    });

    it('should not allow menu item if no roles match', function () {
      var itemRoles = ['role1', 'role2'], userRoles = ['role3'];
      expect(service.isItemAllowed(itemRoles, userRoles)).toBe(false);
    });

    it('should check current user when getting menu items', function () {
      spyOn(auth, 'getCurrentUser').and.callThrough();
      service.getMenuItems();
      expect(auth.getCurrentUser).toHaveBeenCalled();
    });

    it('should return empty menu items set if no current user found', function () {
      spyOn(auth, 'getCurrentUser').and.returnValue(null);
      service.getMenuItems().then(successCallback);
      scope.$digest();
      expect(successCallback).toHaveBeenCalledWith([]);
    });

    it('should get menu items', function () {
      var item = { id: 'item1' };
      spyOn(auth, 'getCurrentUser').and.returnValue({});
      service.addMenuItems([item]);

      var items;
      service.getMenuItems().then(function (data) { items = data; });
      scope.$digest();

      expect(items.length).toBe(1);
      expect(items[0]).toEqual(item);
    });

    it('should filter menu items by user roles', function () {
      var user = { roles: ['role2'] };
      spyOn(auth, 'getCurrentUser').and.returnValue(user);

      var menuItems = [
        { id: 'item1', roles: ['role1']},
        { id: 'item2', roles: ['role2']}
      ];
      service.addMenuItems(menuItems);

      var items;
      service.getMenuItems().then(function (data) { items = data; });
      scope.$digest();

      expect(items.length).toBe(1);
      expect(items[0]).toEqual(menuItems[1]);
    });
  });
});