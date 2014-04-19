angular.module('collabjs.services')
  .service('peopleService', ['$http', '$q', function ($http, $q) {
    'use strict';
    return {
      /**
       * List public profiles
       * @returns {promise}
       */
      getPeople: function () {
        var d = $q.defer();
        $http.get('/api/people').success(function (data) {
          d.resolve(data || []);
        });
        return d.promise;
      },
      /**
       * List public profiles being followed by the particular user.
       * @param {string} account User account.
       * @returns {promise}
       */
      getFollowing: function (account) {
        var d = $q.defer()
          , query = '/api/u/' + account + '/following';
        $http.get(query).success(function(data) { d.resolve(data); });
        return d.promise;
      },
      /**
       * List public profiles following the particular user.
       * @param {string} account User account.
       * @returns {promise}
       */
      getFollowers: function (account) {
        var d = $q.defer()
          , query = '/api/u/' + account + '/followers';
        $http.get(query).success(function(data) { d.resolve(data); });
        return d.promise;
      },
      /**
       * Check whether profile can be followed.
       * @param profile
       * @returns {boolean}
       */
      canFollow: function (profile) {
        return profile && !profile.isFollowed && !profile.isOwnProfile;
      },
      /**
       * Check whether profile can be unfollowed.
       * @param profile
       * @returns {boolean}
       */
      canUnfollow: function (profile) {
        return profile && profile.isFollowed && !profile.isOwnProfile;
      },
      /**
       * Get country name for the given profile.
       * @param profile
       * @returns {string}
       */
      getCountryName: function (profile) {
        if (profile && profile.location) {
          return collabjs.countries[profile.location.toUpperCase()];
        } else {
          return '';
        }
      },
      /**
       * Get 'following' list url for the particular profile.
       * @param profile
       * @returns {string}
       */
      getFollowingUrl: function (profile) {
        return (profile && profile.account) ? '/#/people/' + profile.account + '/following' : null;
      },
      /**
       * Get 'followers' list url for the particular profile.
       * @param profile
       * @returns {string}
       */
      getFollowersUrl: function (profile) {
        return (profile && profile.account) ? '/#/people/' + profile.account + '/followers' : null;
      },
      /**
       * Follow the profile.
       * @param profile
       */
      follow: function (profile) {
        if (profile && profile.account) {
          var uri = '/api/u/' + profile.account + '/follow';
          $http.post(uri).success(function () {
            profile.isFollowed = true;
          });
        }
      },
      /**
       * Unfollow the profile.
       * @param profile
       */
      unfollow: function (profile) {
        if (profile && profile.account) {
          var uri = '/api/u/' + profile.account + '/unfollow';
          $http.post(uri).success(function () {
            profile.isFollowed = false;
          });
        }
      }
    };
  }]);