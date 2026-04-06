"use strict";

var server = require("server");
var NoibuHelpers = require("*/cartridge/scripts/helpers/NoibuHelpers");
var safe = require("*/cartridge/scripts/helpers/safe");
server.extend(module.superModule);

server.append("Begin", function (req, res, next) {
  safe(() => {
    res.setViewData(NoibuHelpers.getCustomer(req.currentCustomer));
    res.setViewData(NoibuHelpers.getCart());

    var BasketMgr = require("dw/order/BasketMgr");
    var basket = BasketMgr.getCurrentBasket();
    if (basket) {
      var checkoutStarted = NoibuHelpers.getCheckoutForTracking(basket, basket.UUID);
      if (checkoutStarted) {
        res.setViewData({ noibu_checkout_started: checkoutStarted });
      }
    }
  });
  next();
});

module.exports = server.exports();
