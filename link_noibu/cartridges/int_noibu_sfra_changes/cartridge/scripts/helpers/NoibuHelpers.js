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

/**
 * Builds a Shopify-shaped productVariant payload from a raw SFCC product.
 * Shared by getProductViewedForTracking and getCollectionViewedForTracking.
 *
 * @param {dw.catalog.Product} product
 * @returns {Object} productVariant payload
 */
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
