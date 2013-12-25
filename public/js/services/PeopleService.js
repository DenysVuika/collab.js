angular.module('collabjs.services')
  .service('peopleService', ['$http', '$q', function ($http, $q) {
    'use strict';
    var _people = [];
    return {
      getPeople: function () {
        var deferred = $q.defer();

        if (_people.length === 0) {
          $http.get('/api/people').success(function (data) {
            // TODO: return array instead of object
            _people = data.feed || [];
            deferred.resolve(_people);
          });
        } else {
          deferred.resolve(_people);
        }

        return deferred.promise;
      },
      getFollowing: function (account) {
        var d = $q.defer()
          , query = '/api/people/' + account + '/following';
        $http.get(query).success(function(data) { d.resolve(data); });
        return d.promise;
      },
      getFollowers: function (account) {
        var d = $q.defer()
          , query = '/api/people/' + account + '/followers';
        $http.get(query).success(function(data) { d.resolve(data); });
        return d.promise;
      },
      canFollow: function (profile) {
        return profile && !profile.isFollowed && !profile.isOwnProfile;
      },
      canUnfollow: function (profile) {
        return profile && profile.isFollowed && !profile.isOwnProfile;
      },
      getCountryName: function (profile) {
        if (profile && profile.location) {
          return collabjs.countries[profile.location.toUpperCase()];
        } else {
          return '';
        }
      },
      // TODO: moved to 'wallUrl' filter
      getProfileFeed: function (profile) {
        if (typeof profile === 'string') {
          return '/people/' + profile + '/timeline';
        }
        if (profile && profile.account) {
          return '/people/' + profile.account + '/timeline';
        }
        return null;
      },
      getFollowingUrl: function (profile) {
        return profile ? '/#/people/' + profile.account + '/following' : null;
      },
      getFollowersUrl: function (profile) {
        return profile ? '/#/people/' + profile.account + '/followers' : null;
      },
      follow: function (profile) {
        var followAction = '/api/people/' + profile.account + '/follow';
        $http.get(followAction).success(function () {
          profile.isFollowed = true;
        });
      },
      unfollow: function (profile) {
        var unfollowAction = '/api/people/' + profile.account + '/unfollow';
        $http.get(unfollowAction).success(function () {
          profile.isFollowed = false;
        });
      }
    };
  }]);