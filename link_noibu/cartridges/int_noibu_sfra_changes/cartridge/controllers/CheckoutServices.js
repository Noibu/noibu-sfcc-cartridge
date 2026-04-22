"use strict";

var server = require("server");
var NoibuHelpers = require("*/cartridge/scripts/helpers/NoibuHelpers");
var safe = require("*/cartridge/scripts/helpers/safe");
server.extend(module.superModule);

server.append("SubmitCustomer", function (req, res, next) {
  safe(() => {
    var viewData = res.getViewData();
    if (!viewData.error) {
      var BasketMgr = require("dw/order/BasketMgr");
      var basket = BasketMgr.getCurrentBasket();
      if (basket) {
        var checkoutPayload = NoibuHelpers.getCheckoutForTracking(basket, basket.UUID);
        if (checkoutPayload) {
          res.setViewData({ noibu_checkout_contact_info_submitted: checkoutPayload });
        }
      }
    }
  });
  next();
});

server.append("SubmitPayment", function (req, res, next) {
  safe(() => {
    var viewData = res.getViewData();
    if (!viewData.error) {
      var BasketMgr = require("dw/order/BasketMgr");
      var basket = BasketMgr.getCurrentBasket();
      if (basket) {
        var checkoutPayload = NoibuHelpers.getCheckoutForTracking(basket, basket.UUID);
        if (checkoutPayload) {
          res.setViewData({ noibu_payment_info_submitted: checkoutPayload });
        }
      }
    }
  });
  next();
});

module.exports = server.exports();
