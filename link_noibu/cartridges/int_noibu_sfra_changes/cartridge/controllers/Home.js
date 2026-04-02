"use strict";

var server = require("server");
var NoibuHelpers = require("*/cartridge/scripts/helpers/NoibuHelpers");
var safe = require("*/cartridge/scripts/helpers/safe");
server.extend(module.superModule);

server.append("Show", function (req, res, next) {
  safe(() => {
    res.setViewData(NoibuHelpers.getCustomer(req.currentCustomer));
    res.setViewData(NoibuHelpers.getCart());
  });
  next();
});

module.exports = server.exports();
