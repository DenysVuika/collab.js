'use strict';

describe('filters', function () {
  describe('wallUrl', function () {
    beforeEach(module('collabjs.filters'));

    var filter;

    beforeEach(inject(function ($filter) {
      filter = $filter('wallUrl');
    }));

    it('should have filter registered', function () {
      expect(filter).not.toEqual(null);
    });

    it('should filter string', function () {
      var result = filter('johndoe');
      expect(result).toBe('/#/people/johndoe');
    });

    it('should filter object', function () {
      var obj = { account: 'johndoe' };
      expect(filter(obj)).toBe('/#/people/johndoe');
    });

    it('should return null result', function () {
      expect(filter(null)).toBeNull();
      expect(filter({})).toBeNull();
    });
  });
});