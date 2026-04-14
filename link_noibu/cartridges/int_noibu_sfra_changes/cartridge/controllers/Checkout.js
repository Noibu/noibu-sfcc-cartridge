"use strict";

var server = require("server");
var safe = require("*/cartridge/scripts/helpers/safe");
server.extend(module.superModule);

// Signal to noibuFooterInclude.isml that checkout_started should be fetched from the uncached endpoint
server.append("Begin", function (req, res, next) {
    safe(() => {
        res.setViewData({ noibu_page_type: "checkout" });
    });
    next();
});

module.exports = server.exports();
