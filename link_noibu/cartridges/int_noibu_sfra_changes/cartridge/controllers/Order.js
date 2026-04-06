"use strict";

var server = require("server");
var NoibuHelpers = require("*/cartridge/scripts/helpers/NoibuHelpers");
var safe = require("*/cartridge/scripts/helpers/safe");
server.extend(module.superModule);

server.append("Confirm", function (req, res, next) {
  safe(() => {
    // Check both query parameters (GET) and form data (POST)
    var orderId = req.form.orderID || req.querystring.orderID;
    var orderToken = req.form.orderToken || req.querystring.orderToken;
    res.setViewData(NoibuHelpers.getCustomer(req.currentCustomer));
    res.setViewData(NoibuHelpers.getCart());
    res.setViewData(NoibuHelpers.getOrder(orderId, orderToken));

    var checkoutCompleted = NoibuHelpers.getOrderCheckoutForTracking(orderId, orderToken);
    if (checkoutCompleted) {
      res.setViewData({ noibu_checkout_completed: checkoutCompleted });
    }
  });
  next();
});

module.exports = server.exports();
