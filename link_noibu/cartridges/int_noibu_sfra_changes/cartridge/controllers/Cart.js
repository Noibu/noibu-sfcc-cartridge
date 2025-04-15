"use strict";

var server = require("server");
var NoibuHelpers = require("*/cartridge/scripts/helpers/NoibuHelpers");
server.extend(module.superModule);

server.append("Show", function (req, res, next) {
  res.setViewData(NoibuHelpers.getCustomer(req.currentCustomer));
  res.setViewData(NoibuHelpers.getCart());

  next();
});

module.exports = server.exports();
