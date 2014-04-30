angular.module('collabjs')
  .config(['$routeProvider', function ($routeProvider) {
    'use strict';
    /*var resolver = function (roles) {
      return {
        load: function ($q) {
          var d = $q.defer();
          d.resolve();
          return d.promise;
        },
        isAdmin: collabjs.isAdmin
      };
    };*/
    // register additional routes within application
    $routeProvider
      .when('/admin', {
        templateUrl: '/admin/templates/index.html',
        controller: 'AdminSettingsCtrl',
        title: 'Admin Settings',
        resolve: { isAdmin: collabjs.isAdmin }
      })
      .when('/admin/accounts', {
        templateUrl: '/admin/templates/accounts.html',
        controller: 'AdminAccountsCtrl',
        title: 'Accounts',
        resolve: { isAdmin: collabjs.isAdmin }
      })
      .when('/admin/accounts/new', {
        templateUrl: '/admin/templates/account-new.html',
        controller: 'AdminNewAccCtrl',
        title: 'New account',
        resolve: { isAdmin: collabjs.isAdmin }
      })
      .when('/admin/accounts/a/:account', {
        templateUrl: '/admin/templates/account-edit.html',
        controller: 'AdminEditAccCtrl',
        title: 'Edit account',
        resolve: { isAdmin: collabjs.isAdmin }
      })
      .when('/admin/accounts/a/:account/pwd', {
        templateUrl: '/admin/templates/account-pwd.html',
        controller: 'AdminPwdCtrl',
        title: 'Change password',
        resolve: { isAdmin: collabjs.isAdmin }
      })
      .when('/admin/roles', {
        templateUrl: '/admin/templates/roles.html',
        controller: 'AdminRolesCtrl',
        title: 'Roles',
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