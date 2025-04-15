exports.afterFooter = function (pdict) {
  var ISML = require("dw/template/ISML");
  ISML.renderTemplate("/noibu/include/noibuFooterInclude");
};
