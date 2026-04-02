"use strict";

var server = require("server");
var NoibuHelpers = require("*/cartridge/scripts/helpers/NoibuHelpers");
var safe = require("*/cartridge/scripts/helpers/safe");
server.extend(module.superModule);

server.append("Show", function (req, res, next) {
  safe(() => {
    res.setViewData(NoibuHelpers.getCustomer(req.currentCustomer));
    res.setViewData(NoibuHelpers.getCart());

    if (req.querystring.cgid) {
      var productSearch = res.getViewData().productSearch;
      var collection = NoibuHelpers.getCollectionForTracking(productSearch);
      if (collection) {
        res.setViewData({ noibu_collection_viewed: collection });
      }
    }
  });
  next();
});

module.exports = server.exports();
