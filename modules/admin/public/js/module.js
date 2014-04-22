angular.module('collabjs')
  .config(['$routeProvider', function ($routeProvider) {
    'use strict';
    // register additional routes within application
    $routeProvider
      .when('/admin', {
        template: '<div ng-include="templateUrl"></div>',
        controller: 'AdminSettingsCtrl',
        title: 'Admin Settings',
        resolve: { isAdmin: collabjs.isAdmin }
      })
      .when('/admin/users', {
        template: '<div ng-include="templateUrl"></div>',
        controller: 'AdminAccountsCtrl',
        title: 'admin: accounts',
        resolve: { isAdmin: collabjs.isAdmin }
      })
      .when('/admin/roles', {
        template: '<div ng-include="templateUrl"></div>',
        controller: 'AdminRolesCtrl',
        title: 'admin: roles',
        resolve: { isAdmin: collabjs.isAdmin }
      });
  }])
  .run(function (menuService) {
    'use strict';
    // register additional menu items
    menuService.addMenuItems([
      {
        id: 'collabjs.admin.menu.item1',
        icon: 'fa-wrench',
        title: 'Admin Settings',
        url: '/#/admin',
        roles: [ 'administrator' ]
      }
    ]);
  });