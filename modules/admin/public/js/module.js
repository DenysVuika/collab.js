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
      .when('/admin/section1', {
        template: '<div ng-include="templateUrl"></div>',
        controller: 'Section1Ctrl',
        title: 'admin: section 1',
        resolve: { isAdmin: collabjs.isAdmin }
      })
      .when('/admin/section2', {
        template: '<div ng-include="templateUrl"></div>',
        controller: 'Section2Ctrl',
        title: 'admin: section 1',
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