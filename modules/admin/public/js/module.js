angular.module('collabjs')
  .config(['$routeProvider', function ($routeProvider) {
    'use strict';
    // register additional routes within application
    $routeProvider.when('/admin/page1', {
      template: '<div ng-include="templateUrl"></div>',
      controller: 'AdminPage1Controller',
      title: 'Admin Page 1',
      resolve: { isAdmin: collabjs.isAdmin }
    });
  }])
  .run(function (menuService) {
    'use strict';
    // register additional menu items
    menuService.addMenuItems([
      {
        id: 'collabjs.admin.menu.item1',
        icon: 'fa-lock',
        title: 'Admin page 1',
        url: '/#/admin/page1',
        roles: [ 'administrator' ]
      }
    ]);
  });

angular.module('collabjs.controllers')
  .controller('AdminPage1Controller', ['$scope', 'isAdmin',
    function ($scope, isAdmin) {
      'use strict';

      $scope.templateUrl = isAdmin ? '/admin/public/templates/page1.html' : '/templates/403.html';
    }]);