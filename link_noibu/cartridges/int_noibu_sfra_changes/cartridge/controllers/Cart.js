"use strict";

var server = require("server");
var NoibuHelpers = require("*/cartridge/scripts/helpers/NoibuHelpers");
var safe = require("*/cartridge/scripts/helpers/safe");
server.extend(module.superModule);

server.append("Show", function (req, res, next) {
  safe(() => {
    res.setViewData(NoibuHelpers.getCustomer(req.currentCustomer));
    res.setViewData(NoibuHelpers.getCart());

    var cart = NoibuHelpers.getCartForTracking();
    if (cart) {
      res.setViewData({ noibu_cart_viewed: cart });
    }
  });
  next();
});

// Capture removed line item data before the base handler deletes it
server.prepend("RemoveProductLineItem", function (req, res, next) {
  safe(() => {
    if (req.querystring.pid && req.querystring.uuid) {
      var BasketMgr = require("dw/order/BasketMgr");
      var currentBasket = BasketMgr.getCurrentBasket();
      if (currentBasket) {
        var productLineItems = currentBasket.getAllProductLineItems(req.querystring.pid);
        for (var i = 0; i < productLineItems.length; i++) {
          var item = productLineItems[i];
          if (item.UUID === req.querystring.uuid) {
            var cartLine = NoibuHelpers.getCartLineForTracking(item);
            if (cartLine) {
              res.setViewData({ noibu_product_removed_from_cart: cartLine });
            }
            break;
          }
        }
      }
    }
  });
  next();
});

// Inject added line item data into the AddProduct JSON response
server.append("AddProduct", function (req, res, next) {
  safe(() => {
    var viewData = res.getViewData();
    if (!viewData.error && viewData.pliUUID) {
      var BasketMgr = require("dw/order/BasketMgr");
      var currentBasket = BasketMgr.getCurrentBasket();
      if (currentBasket) {
        var productLineItems = currentBasket.getAllProductLineItems(req.form.pid);
        for (var i = 0; i < productLineItems.length; i++) {
          var item = productLineItems[i];
          if (item.UUID === viewData.pliUUID) {
            var cartLine = NoibuHelpers.getCartLineForTracking(item);
            if (cartLine) {
              res.setViewData({ noibu_product_added_to_cart: cartLine });
            }
            break;
          }
        }
      }
    }
  });
  next();
});

module.exports = server.exports();
