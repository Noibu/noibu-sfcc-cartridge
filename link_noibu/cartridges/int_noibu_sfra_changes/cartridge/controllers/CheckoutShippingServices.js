"use strict";

var server = require("server");
var NoibuHelpers = require("*/cartridge/scripts/helpers/NoibuHelpers");
var safe = require("*/cartridge/scripts/helpers/safe");
server.extend(module.superModule);

// SubmitShipping sets both the shipping address and the shipping method,
// so both checkout_address_info_submitted and checkout_shipping_info_submitted
// are fired from this single endpoint.
server.append("SubmitShipping", function (req, res, next) {
  safe(() => {
    var viewData = res.getViewData();
    if (!viewData.error) {
      var BasketMgr = require("dw/order/BasketMgr");
      var basket = BasketMgr.getCurrentBasket();
      if (basket) {
        var checkoutPayload = NoibuHelpers.getCheckoutForTracking(basket, basket.UUID);
        if (checkoutPayload) {
          res.setViewData({
            noibu_checkout_address_info_submitted: checkoutPayload,
            noibu_checkout_shipping_info_submitted: checkoutPayload,
          });
        }
      }
    }
  });
  next();
});

module.exports = server.exports();
