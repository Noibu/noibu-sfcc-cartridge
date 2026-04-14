"use strict";

var server = require("server");
server.extend(module.superModule);

server.append("Confirm", function (req, res, next) {
    try {
        var orderId = req.form.orderID || req.querystring.orderID;
        var orderToken = req.form.orderToken || req.querystring.orderToken;

        if (orderId) {
            res.setViewData({
                noibuOrderParams: {
                    orderID: orderId,
                    orderToken: orderToken || ""
                }
            });
        }
    } catch (error) { // eslint-disable-line no-unused-vars
        // skip to next
    }

    next();
});

module.exports = server.exports();
