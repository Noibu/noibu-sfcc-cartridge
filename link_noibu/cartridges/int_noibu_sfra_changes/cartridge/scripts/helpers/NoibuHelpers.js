"use strict";

module.exports = {
  getCart: function () {
    var BasketMgr = require("dw/order/BasketMgr");
    var basket = BasketMgr.getCurrentBasket();
    if (!basket) return {};

    return {
      noibuCart: {
        cart_id: basket.UUID,
      },
    };
  },

  getCustomer: function (reqCustomer) {
    if (!reqCustomer) return {};
    if (!reqCustomer.profile) return {};
    if (!reqCustomer.profile.customerNo) return {};

    var CustomerMgr = require("dw/customer/CustomerMgr");
    var customer = CustomerMgr.getCustomerByCustomerNumber(
      reqCustomer.profile.customerNo
    );

    if (!customer) return {};

    var customer_groups = [];
    var groups = customer.getCustomerGroups().toArray();
    for (var i = 0; i < groups.length; i++) {
      customer_groups.push(groups[i].getID());
    }

    var noibuAccountInfo = {
      customer_id: customer.getProfile().getCustomerNo(),
      customer_groups: customer_groups.join(","),
    };

    return {
      noibuAccountInfo: noibuAccountInfo,
    };
  },

  getOrder: function (orderId, orderToken) {
    if (!orderId) return {};

    var OrderMgr = require("dw/order/OrderMgr");
    var order = OrderMgr.getOrder(orderId);

    if (!order) return {};

    var couponCodes = [];
    var promotions = [];
    var priceAdjustments = order.getPriceAdjustments();
    for (var i = 0; i < priceAdjustments.length; i++) {
      var pa = priceAdjustments[i];
      if (pa.isBasedOnCoupon()) {
        couponCodes.push(pa.getCouponLineItem().getCouponCode());
      } else {
        promotions.push(pa.getPromotionID());
      }
    }

    var noibuOrder = {
      order_id: order.orderNo,
      order_token: orderToken,
      coupon_codes: couponCodes.join(","),
      promotions: promotions.join(","),
    };

    return {
      noibuOrder: noibuOrder,
    };
  },

  getProductForTracking: function (pid) {
    var ProductMgr = require("dw/catalog/ProductMgr");
    var product = ProductMgr.getProduct(pid);
    if (!product) return null;

    return { productVariant: getProductVariantForTracking(product) };
  },

  getCollectionForTracking: function (productSearch) {
    if (!productSearch || !productSearch.category) return null;

    var ProductMgr = require("dw/catalog/ProductMgr");
    var productVariants = [];
    var productIds = productSearch.productIds;

    for (var i = 0; i < productIds.length; i++) {
      var product = ProductMgr.getProduct(productIds[i].productID);
      if (product) {
        productVariants.push(getProductVariantForTracking(product));
      }
    }

    return {
      collection: {
        id: productSearch.category.id,
        title: productSearch.category.name,
        productVariants: productVariants,
      },
    };
  },

  getSearchForTracking: function (productSearch, query) {
    if (!query) return null;

    var ProductMgr = require("dw/catalog/ProductMgr");
    var productVariants = [];
    var productIds = productSearch ? productSearch.productIds : [];

    for (var i = 0; i < productIds.length; i++) {
      var product = ProductMgr.getProduct(productIds[i].productID);
      if (product) {
        productVariants.push(getProductVariantForTracking(product));
      }
    }

    return {
      searchResult: {
        query: query,
        productVariants: productVariants,
      },
    };
  },

  getCartForTracking: function () {
    var BasketMgr = require("dw/order/BasketMgr");
    var basket = BasketMgr.getCurrentBasket();
    if (!basket) return null;

    var lines = [];
    var productLineItems = basket.productLineItems;
    for (var i = 0; i < productLineItems.length; i++) {
      var cartLine = module.exports.getCartLineForTracking(productLineItems[i]);
      if (cartLine) {
        lines.push(cartLine.cartLine);
      }
    }

    var total = basket.adjustedMerchandizeTotalPrice;

    return {
      cart: {
        id: basket.UUID,
        totalQuantity: basket.productQuantityTotal,
        cost: {
          totalAmount: {
            amount: total ? total.value : 0,
            currencyCode: total ? total.currencyCode : "",
          },
        },
        lines: lines,
      },
    };
  },

  getCheckoutForTracking: function (lineItemCtnr, token) {
    var shipment = lineItemCtnr.defaultShipment;

    var lineItems = [];
    var productLineItems = lineItemCtnr.productLineItems;
    for (var i = 0; i < productLineItems.length; i++) {
      var cartLine = module.exports.getCartLineForTracking(productLineItems[i]);
      if (!cartLine) continue;
      lineItems.push({
        id: cartLine.cartLine.merchandise.product.id,
        quantity: cartLine.cartLine.quantity,
        finalLinePrice: cartLine.cartLine.cost.totalAmount,
        title: cartLine.cartLine.merchandise.product.title,
        variant: cartLine.cartLine.merchandise,
      });
    }

    var discountApplications = [];
    var priceAdjustments = lineItemCtnr.getPriceAdjustments();
    for (var j = 0; j < priceAdjustments.length; j++) {
      var pa = priceAdjustments[j];
      discountApplications.push({
        title: pa.promotionID || "",
        value: {
          amount: pa.price ? Math.abs(pa.price.value) : 0,
          currencyCode: pa.price ? pa.price.currencyCode : "",
        },
      });
    }

    var subtotal = lineItemCtnr.adjustedMerchandizeTotalPrice;
    var totalGross = lineItemCtnr.totalGrossPrice;
    var totalTax = lineItemCtnr.totalTax;
    var shippingTotal = lineItemCtnr.shippingTotalPrice;
    var shippingMethod = shipment ? shipment.shippingMethod : null;

    return {
      checkout: {
        token: token || "",
        email: lineItemCtnr.customerEmail || "",
        phone: lineItemCtnr.billingAddress ? lineItemCtnr.billingAddress.phone || "" : "",
        currencyCode: lineItemCtnr.currencyCode || "",
        lineItems: lineItems,
        billingAddress: getAddressForTracking(lineItemCtnr.billingAddress),
        shippingAddress: getAddressForTracking(shipment ? shipment.shippingAddress : null),
        shippingLine: shippingMethod
          ? {
              price: {
                amount: shippingTotal ? shippingTotal.value : 0,
                currencyCode: shippingTotal ? shippingTotal.currencyCode : "",
              },
            }
          : null,
        subtotalPrice: {
          amount: subtotal ? subtotal.value : 0,
          currencyCode: subtotal ? subtotal.currencyCode : "",
        },
        totalPrice: {
          amount: totalGross ? totalGross.value : 0,
          currencyCode: totalGross ? totalGross.currencyCode : "",
        },
        totalTax: {
          amount: totalTax ? totalTax.value : 0,
          currencyCode: totalTax ? totalTax.currencyCode : "",
        },
        discountApplications: discountApplications,
      },
    };
  },

  getOrderCheckoutForTracking: function (orderId, orderToken) {
    if (!orderId) return null;

    var OrderMgr = require("dw/order/OrderMgr");
    var order = OrderMgr.getOrder(orderId, orderToken);
    if (!order) return null;

    var result = module.exports.getCheckoutForTracking(order, orderToken);
    if (!result) return null;

    result.checkout.order = {
      id: order.orderNo,
      customer: { id: order.customerNo || "" },
    };

    var transactions = [];
    var paymentInstruments = order.getPaymentInstruments();
    for (var i = 0; i < paymentInstruments.length; i++) {
      var pi = paymentInstruments[i];
      var txn = pi.paymentTransaction;
      transactions.push({
        amount: {
          amount: txn ? txn.amount.value : 0,
          currencyCode: txn ? txn.amount.currencyCode : "",
        },
        gateway: pi.paymentMethod || "",
        paymentMethod: { type: pi.paymentMethod || "" },
      });
    }
    result.checkout.transactions = transactions;

    return result;
  },

  getCartLineForTracking: function (pli) {
    var URLUtils = require("dw/web/URLUtils");

    var product = pli.product;
    if (!product) return null;

    var masterProduct = product.isVariant()
      ? product.variationModel.master
      : product;

    var images = product.getImages("small");
    var image = images && images.length > 0 ? images[0] : null;

    var unitPrice = pli.basePrice;
    var totalPrice = pli.adjustedPrice;

    return {
      cartLine: {
        cost: {
          totalAmount: {
            amount: totalPrice ? totalPrice.value : 0,
            currencyCode: totalPrice ? totalPrice.currencyCode : "",
          },
        },
        merchandise: {
          id: pli.productID,
          title: pli.productName,
          sku: product.UPC || pli.productID,
          price: {
            amount: unitPrice ? unitPrice.value : 0,
            currencyCode: unitPrice ? unitPrice.currencyCode : "",
          },
          image: image
            ? {
                src: image.absURL ? image.absURL.toString() : "",
                alt: image.alt || "",
              }
            : null,
          product: {
            id: masterProduct.ID,
            title: masterProduct.name,
            type:
              masterProduct.primaryCategory
                ? masterProduct.primaryCategory.displayName
                : "",
            url: URLUtils.abs("Product-Show", "pid", masterProduct.ID).toString(),
            vendor: masterProduct.brand || "",
          },
        },
        quantity: pli.quantityValue,
      },
    };
  },
};

function getAddressForTracking(address) {
  if (!address) return null;
  return {
    firstName: address.firstName || "",
    lastName: address.lastName || "",
    address1: address.address1 || "",
    address2: address.address2 || "",
    city: address.city || "",
    province: address.stateCode || "",
    provinceCode: address.stateCode || "",
    countryCode: address.countryCode ? address.countryCode.value || String(address.countryCode) : "",
    zip: address.postalCode || "",
    phone: address.phone || "",
  };
}

function getProductVariantForTracking(product) {
  var URLUtils = require("dw/web/URLUtils");

  var masterProduct = product.isVariant()
    ? product.variationModel.master
    : product;

  var images = product.getImages("small");
  var image = images && images.length > 0 ? images[0] : null;
  var priceModel = product.getPriceModel();
  var price = priceModel.getPrice();
  if (!price.available) {
    price = priceModel.getMinPrice();
  }

  return {
    id: product.ID,
    title: product.name,
    sku: product.UPC || product.ID,
    price: {
      amount: price && price.available ? price.value : 0,
      currencyCode: price && price.available ? price.currencyCode : "",
    },
    image: image
      ? { src: image.absURL ? image.absURL.toString() : "" }
      : null,
    product: {
      id: masterProduct.ID,
      title: masterProduct.name,
      type: masterProduct.primaryCategory
        ? masterProduct.primaryCategory.displayName
        : "",
      vendor: masterProduct.brand || "",
      url: URLUtils.abs("Product-Show", "pid", masterProduct.ID).toString(),
    },
  };
}
