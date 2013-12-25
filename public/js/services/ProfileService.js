angular.module('collabjs.services')
  .service('profileService', [
    function () {
      'use strict';
      return {
        profilePictureUrl: function () {
          return  collabjs.currentUser.pictureUrl;
        }
      };
    }
  ]);