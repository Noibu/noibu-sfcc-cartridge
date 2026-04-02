"use strict";

var server = require("server");
var NoibuHelpers = require("*/cartridge/scripts/helpers/NoibuHelpers");
var safe = require("*/cartridge/scripts/helpers/safe");
server.extend(module.superModule);

server.append("Show", function (req, res, next) {
  safe(() => {
    res.setViewData(NoibuHelpers.getCustomer(req.currentCustomer));
    res.setViewData(NoibuHelpers.getCart());

    var productSearch = res.getViewData().productSearch;
    if (req.querystring.cgid) {
      var collection = NoibuHelpers.getCollectionForTracking(productSearch);
      if (collection) {
        res.setViewData({ noibu_collection_viewed: collection });
      }
    } else if (req.querystring.q) {
      var search = NoibuHelpers.getSearchForTracking(productSearch, req.querystring.q);
      if (search) {
        res.setViewData({ noibu_search_submitted: search });
      }
    }
  });
  next();
});

module.exports = server.exports();
