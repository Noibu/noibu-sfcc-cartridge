"use strict";

var server = require("server");
server.extend(module.superModule);

server.append("Confirm", function (req, res, next) {
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

    next();
});

module.exports = server.exports();
