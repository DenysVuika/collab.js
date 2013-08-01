'use strict';

module.exports.detectMobileBrowser = detectMobileBrowser;
module.exports.savedSearches = savedSearches;
module.exports.commonLocals = commonLocals;
module.exports.isUrlLocalToHost = isUrlLocalToHost;

var db = require('./data')
  , auth = require('./collabjs.auth')
  , config = require('./config');

// Stub for reCaptcha that always returns successful result
// used instead of real implementation when reCaptcha feature is disabled,
// allows preserving existing callback chains instead of conditionals
var NullRecaptcha = exports.NullRecaptcha = function NullRecaptcha() {
};

NullRecaptcha.prototype.verify = function (callback) {
  callback(true, null);
};


function detectMobileBrowser(req, res, next) {
  var ua = req.headers['user-agent'];
  if (!ua) {
    req.isMobile = false;
    res.locals.isMobile = false;
    return next();
  }

  ua = ua.toLowerCase();
  if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(ua)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(ua.substr(0,4))) {
    req.isMobile = true;
    res.locals.isMobile = true;
  } else {
    req.isMobile = false;
    res.locals.isMobile = false;
  }

  return next();
}

// middleware that gets saved search lists for current user and
// creates `hasSavedSearch` function for use in Jade views
function savedSearches(req, res, next) {
  res.locals.hasSavedSearch = function (name) {
    var decodedName = decodeURIComponent(name);
    var searches = res.locals.savedSearches;
    if (searches && searches.length > 0) {
      for (var i = 0; i < searches.length; i++) {
        if (searches[i].name === decodedName) {
          return true;
        }
      }
    }
    return false;
  };
  if (req.isAuthenticated()) {
    db.getSavedSearches(req.user.id, function (err, result) {
      res.locals.savedSearches = result;
      next();
    });
  } else {
    res.locals.savedSearches = [];
    next();
  }
}

// Initialize variables that are provided to all templates rendered within the application
function commonLocals(req, res, next) {
  res.locals.collabjs = res.locals.collabjs || {
    config: config,
    token: req.session._csrf,
    user: req.user,
    isAuthenticated: req.isAuthenticated(),
    isAdministrator: auth.isUserInRole(req.user, 'administrator')
  };
  next();
}

function isUrlLocalToHost(url) {
  return !isStringEmpty(url) &&
    ((url[0] === '/' && (url.length === 1 || (url[1] !== '/' && url[1] !== '\\'))) || // "/" or "/foo" but not "//" or "/\"
      (url.length > 1 && url[0] === '~' && url[1] === '/' )); // "~/" or "~/foo"
}

function isStringEmpty(str) {
  return !(str && str !== '');
}