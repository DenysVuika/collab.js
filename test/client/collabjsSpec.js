'use strict';

describe('core', function () {
  describe('collabjs', function () {

    it('formatCountry returns empty string when entry is missing', function () {
      var result = collabjs.formatCountry(null);
      expect(result).toBe('');
    });

    it('formatCountry returns entry text when id is missing', function () {
      var text = 'some text';
      var result = collabjs.formatCountry({ text: text });
      expect(result).toBe(text);
    });

    it('formatCountry gives formatted output', function () {
      var result = collabjs.formatCountry({ id: 'UA', text: 'Ukraine' });
      var expected = '<i class="flag-icon-16 flag-ua"></i>Ukraine';
      expect(result).toBe(expected);
    });

  });
});