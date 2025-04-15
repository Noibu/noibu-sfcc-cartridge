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
};
