// Stub for reCaptcha that always returns successful result
// used instead of real implementation when reCaptcha feature is disabled,
// allows preserving existing callback chains instead of conditionals
var NullRecaptcha = exports.NullRecaptcha = function NullRecaptcha() {
};

NullRecaptcha.prototype.verify = function (callback) {
  callback(true, null);
};
