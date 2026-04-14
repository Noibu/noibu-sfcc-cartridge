/******/ (() => { // webpackBootstrap
/******/ 	"use strict";


window.noibuSFCC = (() => {
    // Public: called by noibuFooterInclude.isml with server-rendered config
    const init = (config) => {
        const run = () => fetchPageVisitData(config);
        if (window.NOIBUJS) {
            run();
        } else {
            window.addEventListener("noibuSDKReady", run);
        }
    };

    const track = (eventName, eventData) => NOIBUJS.track(eventName, eventData);

    // Fetch session-specific data from the uncached endpoint
    const fetchPageVisitData = (config) => {
        const pageUrlParams = new URLSearchParams(window.location.search);
        const orderId = config.orderId || pageUrlParams.get('orderID');
        const orderToken = config.orderToken || pageUrlParams.get('orderToken');

        const url = new URL(config.attributesUrl, window.location.origin);

        if (orderId) {
            url.searchParams.set('orderID', orderId);
            if (orderToken) url.searchParams.set('orderToken', orderToken);
        }

        if (config.pageType) {
            url.searchParams.set('page', config.pageType);
            if (config.pageId) url.searchParams.set('pageId', config.pageId);
        }

        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                addCustomAttributes(data);
                trackPageEvents(data);
            });
    };

    const trackPageEvents = (data) => {
        if (data.noibu_cart_viewed) track('cart_viewed', data.noibu_cart_viewed);
        if (data.noibu_checkout_started) track('checkout_started', data.noibu_checkout_started);
        if (data.noibu_checkout_completed) track('checkout_completed', data.noibu_checkout_completed);
        if (data.noibu_product_viewed) track('product_viewed', data.noibu_product_viewed);
        if (data.noibu_collection_viewed) track('collection_viewed', data.noibu_collection_viewed);
        if (data.noibu_search_submitted) track('search_submitted', data.noibu_search_submitted);
    };

    const addCustomAttributes = (data) => {
        const attributes = {
            customer_id: data.noibuAccountInfo?.customer_id,
            customer_groups: data.noibuAccountInfo?.customer_groups,
            cart_id: data.noibuCart?.cart_id,
            order_id: data.noibuOrder?.order_id,
            order_token: data.noibuOrder?.order_token,
            coupon_codes: data.noibuOrder?.coupon_codes,
            promotions: data.noibuOrder?.promotions,
            'sfcc-session-id': data.dwsid
        };
        Object.entries(attributes).forEach(([key, value]) => {
            if (value) window.NOIBUJS.addCustomAttribute(key, value);
        });
    };

    // Monitor AJAX responses for cart/checkout step events
    const setupAjaxListeners = () => {
        if (typeof $ === "undefined") return;

        $(document).ajaxComplete((event, xhr) => {
            let data;
            try { data = JSON.parse(xhr.responseText); } catch { return; }

            if (data.noibu_product_added_to_cart) track("product_added_to_cart", data.noibu_product_added_to_cart);
            if (data.noibu_product_removed_from_cart) track("product_removed_from_cart", data.noibu_product_removed_from_cart);
            if (data.noibu_payment_info_submitted) track("payment_info_submitted", data.noibu_payment_info_submitted);
            if (data.noibu_checkout_contact_info_submitted) track("checkout_contact_info_submitted", data.noibu_checkout_contact_info_submitted);
            if (data.noibu_checkout_address_info_submitted) {
                track("checkout_address_info_submitted", data.noibu_checkout_address_info_submitted);
                track("checkout_shipping_info_submitted", data.noibu_checkout_shipping_info_submitted);
            }
        });
    };

    // Bootstrap
    localStorage.setItem('n_platform', '1'); // disable funnel step ecomm events

    // Defer until DOMContentLoaded so jQuery is guaranteed to be available
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAjaxListeners);
    } else {
        setupAjaxListeners();
    }

    return { init };
})();

/******/ })()
;