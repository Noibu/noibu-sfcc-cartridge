"use strict";

var server = require("server");

/**
 * Noibu-GetAttributes : Returns session-specific customer, cart, and order data as JSON.
 * This endpoint is intentionally not cached so it always reflects the current session.
 */
server.get("GetAttributes", function (req, res, next) {
    var NoibuHelpers = require("*/cartridge/scripts/helpers/NoibuHelpers");

    response.setExpires(new Date(0)); // eslint-disable-line no-undef

    var customerData = NoibuHelpers.getCustomer(req.currentCustomer);
    var cartData = NoibuHelpers.getCart();

    var orderId = req.querystring.orderID;
    var orderToken = req.querystring.orderToken;
    var orderData = orderId ? NoibuHelpers.getOrder(orderId, orderToken) : {};

    var cookies = request.httpCookies; // eslint-disable-line no-undef
    var dwsidCookie = cookies && cookies['dwsid'];
    var dwsid = dwsidCookie && dwsidCookie.value ? dwsidCookie.value.substring(0, 10) : null;

    res.json({
        noibuAccountInfo: customerData.noibuAccountInfo || null,
        noibuCart: cartData.noibuCart || null,
        noibuOrder: orderData.noibuOrder || null,
        dwsid: dwsid
    });

    next();
});

module.exports = server.exports();
