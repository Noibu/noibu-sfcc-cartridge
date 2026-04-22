"use strict";

var server = require("server");
var safe = require("*/cartridge/scripts/helpers/safe");
server.extend(module.superModule);

server.append("Show", function (req, res, next) {
    safe(() => {
        res.setViewData({ noibu_page_type: "product", noibu_page_id: req.querystring.pid });
    });
    next();
});

module.exports = server.exports();
