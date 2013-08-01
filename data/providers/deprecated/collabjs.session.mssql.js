'use strict';

// TODO: MSSQL implementation needed, for now using MemoryStore as a fallback

var express = require('express');

module.exports = function (connect) {
  return express.session.MemoryStore;
};