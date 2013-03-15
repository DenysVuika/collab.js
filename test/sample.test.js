/* global describe, it */
'use strict';

var assert = require('assert')
  , data = require('../data');

describe('Samples', function(){
  describe('data layer', function () {
    it('getAccountById', function (done) {
      var provider = {
        getAccountById: function (id, callback) {
          callback(null, { id: id });
        }
      };
      data.setProvider(provider);
      data.getAccountById(1, function (err, result) {
        if (err) {
          done(err);
        } else {
          assert.equal(result.id, 1);
          done();
        }
      });
    });
  });
});