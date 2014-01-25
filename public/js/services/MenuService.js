angular.module('collabjs.services')
  .service('menuService', ['$q', 'authService',
    function ($q, authService) {
      'use strict';

      var menuItems = {};

      // Typical menu item sample:
      /*
       {
          id: 'collabjs.menu.item1',
          icon: 'fa-lock',
          title: 'Title',
          url: '/#/some/route',
          roles: [ 'administrator' ]
       }
       */

      function isItemAllowed(itemRoles, userRoles) {
        // accept if item has no role requirements
        if (!itemRoles || itemRoles.length === 0) {
          return true;
        }

        // reject if user has no roles
        if (!userRoles || userRoles.length === 0) {
          return false;
        }

        // check whether user has at least one role listed in menu item
        for (var i = 0; i < itemRoles.length; i++) {
          for (var k = 0; k < userRoles.length; k++) {
            if (userRoles[k] === itemRoles[i]) {
              return true;
            }
          }
        }

        // reject by default
        return false;
      }

      return {
        getMenuItems: function () {
          var d = $q.defer();

          var user = authService.getCurrentUser();
          // do not return menu items if user has not logged in
          if (!user) {
            d.resolve([]);
            return d.promise;
          }

          var names = Object.keys(menuItems);
          var result = [];
          var item;

          for (var i = 0; i < names.length; i++) {
            item = menuItems[names[i]];
            // check whether item declares roles to check
            if (item.roles && item.roles.length > 0) {
              // check whether current user can use this item
              if (isItemAllowed(item.roles, user.roles)) {
                result.push(item);
              }
            } else {
              // otherwise treat menu item as public
              result.push(item);
            }
          }
          d.resolve(result);
          return d.promise;
        },
        addMenuItems: function (items) {
          var item;
          for (var i = 0; i < items.length; i++) {
            item = items[i];
            if (item.id) {
              menuItems[item.id] = item;
            }
          }
        }
      };
    }]);