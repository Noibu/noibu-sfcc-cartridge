"use strict";

var server = require("server");
var safe = require("*/cartridge/scripts/helpers/safe");
server.extend(module.superModule);

server.append("Show", function (req, res, next) {
    safe(() => {
        if (req.querystring.cgid) {
            res.setViewData({ noibu_page_type: "collection", noibu_page_id: req.querystring.cgid });
        } else if (req.querystring.q) {
            res.setViewData({ noibu_page_type: "search", noibu_page_id: req.querystring.q });
        }
    });
    next();
});

module.exports = server.exports();
