"use strict";

var server = require("server");
var Logger = require("dw/system/Logger").getLogger("noibu", "noibu");

/**
 * Noibu-GetAttributes : Returns session-specific customer, cart, and order data as JSON.
 * This endpoint is intentionally not cached so it always reflects the current session.
 *
 * Optional query params:
 *   page=cart                   → also returns noibu_cart_viewed tracking payload
 *   page=checkout               → also returns noibu_checkout_started tracking payload
 *   page=product + pid=...      → also returns noibu_product_viewed tracking payload
 *   page=collection + cgid=...  → also returns noibu_collection_viewed tracking payload
 *   page=search + q=...         → also returns noibu_search_submitted tracking payload
 *   orderID + orderToken        → also returns noibu_checkout_completed tracking payload
 */
server.get("GetAttributes", function (req, res, next) {
    var NoibuHelpers = require("*/cartridge/scripts/helpers/NoibuHelpers");

    response.setExpires(new Date(0)); // eslint-disable-line no-undef

    var customerData = NoibuHelpers.getCustomer(req.currentCustomer);
    var cartData = NoibuHelpers.getCart();

    var orderId = req.querystring.orderID;
    var orderToken = req.querystring.orderToken;
    var orderData = orderId ? NoibuHelpers.getOrder(orderId, orderToken) : {};

    var cookies = request.httpCookies; // eslint-disable-line no-undef
    var dwsidCookie = cookies && cookies['dwsid'];
    var dwsid = dwsidCookie && dwsidCookie.value ? dwsidCookie.value.substring(0, 10) : null;

    var result = {
        noibuAccountInfo: customerData.noibuAccountInfo || null,
        noibuCart: cartData.noibuCart || null,
        noibuOrder: orderData.noibuOrder || null,
        dwsid: dwsid
    };

    // Page-specific ecomm tracking events — all shopper/session data is fetched here to bypass page cache
    var pageType = req.querystring.page;
    var pageId = req.querystring.pageId;

    if (pageType === 'cart') {
        try {
            result.noibu_cart_viewed = NoibuHelpers.getCartForTracking() || null;
        } catch (e) { Logger.error("noibu_cart_viewed error: {0}", e.message); }

    } else if (pageType === 'checkout') {
        try {
            var BasketMgr = require('dw/order/BasketMgr');
            var basket = BasketMgr.getCurrentBasket();
            result.noibu_checkout_started = basket ? NoibuHelpers.getCheckoutForTracking(basket, basket.UUID) || null : null;
        } catch (e) { Logger.error("noibu_checkout_started error: {0}", e.message); }

    } else if (pageType === 'product') {
        try {
            result.noibu_product_viewed = NoibuHelpers.getProductForTracking(pageId) || null;
        } catch (e) { Logger.error("noibu_product_viewed error: {0}", e.message); }

    } else if (pageType === 'collection') {
        try {
            result.noibu_collection_viewed = NoibuHelpers.getCollectionForTracking(buildProductSearch(pageType, pageId)) || null;
        } catch (e) { Logger.error("noibu_collection_viewed error: {0}", e.message); }

    } else if (pageType === 'search') {
        try {
            result.noibu_search_submitted = NoibuHelpers.getSearchForTracking(buildProductSearch(pageType, pageId), pageId) || null;
        } catch (e) { Logger.error("noibu_search_submitted error: {0}", e.message); }
    }

    if (orderId) {
        try {
            result.noibu_checkout_completed = NoibuHelpers.getOrderCheckoutForTracking(orderId, orderToken) || null;
        } catch (e) { Logger.error("noibu_checkout_completed error: {0}", e.message); }
    }

    res.json(result);
    next();
});

function buildProductSearch(pageType, pageId) {
    var ProductSearchModel = require('dw/catalog/ProductSearchModel');
    var apiSearch = new ProductSearchModel();

    if (pageType === 'collection') {
        apiSearch.categoryID = pageId;
        apiSearch.setRecursiveCategorySearch(true);
    } else {
        apiSearch.searchPhrase = pageId;
    }
    apiSearch.search();

    var category = apiSearch.category;

    // products is a dw.util.Iterator, not a Collection — iterate manually
    var productIds = [];
    var productsIter = apiSearch.products;
    while (productsIter.hasNext()) {
        productIds.push({ productID: productsIter.next().ID });
    }

    return {
        category: category ? { id: category.ID, name: category.displayName } : null,
        productIds: productIds
    };
}

module.exports = server.exports();
