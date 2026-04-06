/******/ (() => { // webpackBootstrap
/******/ 	"use strict";


/**
 * Checks if the NOIBUJS SDK is loaded and adds a custom attribute to the SDK.
 *
 * This function ensures that the NOIBUJS SDK is available before attempting
 * to add a custom attribute. It listens for the `noibuSDKReady` event if the SDK
 * is not yet loaded. Once the SDK is ready, it checks for an SFCC session ID
 * (`dwsid`) in the page's meta tags and adds it as a custom attribute to the SDK.
 *
 * The function also logs relevant SDK readiness information to the console for debugging.
 *
 * @async
 * @function checkSDKExistanceAndAddCustomAttribute
 * @returns {Promise<void>} Resolves when the NOIBUJS SDK is ready and the custom attribute is added.
 */
async function checkSDKExistanceAndAddCustomAttribute() {
    const script = document.querySelector('script[data-noibu-session-id]');
    const dwsid = script ? script.getAttribute('data-noibu-session-id') : undefined;
    if (!window.NOIBUJS && dwsid && dwsid.length > 0) {
        await new Promise((resolve) => {
            window.addEventListener("noibuSDKReady", resolve);
        });
    }

    if (dwsid && dwsid.length > 0) {
        window.NOIBUJS.addCustomAttribute("sfcc-session-id", dwsid);
    }
}

async function monitorEcommerceEvents() {
    localStorage.setItem('n_platform', '1'); // disable funnel step ecomm events

    await new Promise(resolve => document.addEventListener("DOMContentLoaded", resolve));

    if (typeof $ === "undefined") return;

    $(document).ajaxComplete((_event, xhr) => {
        let data;
        try { data = JSON.parse(xhr.responseText); } catch { return; }

        if (data.noibu_product_added_to_cart) {
            track("product_added_to_cart", data.noibu_product_added_to_cart);
        }
        if (data.noibu_product_removed_from_cart) {
            track("product_removed_from_cart", data.noibu_product_removed_from_cart);
        }
        if (data.noibu_checkout_contact_info_submitted) {
            track("checkout_contact_info_submitted", data.noibu_checkout_contact_info_submitted);
        }
        if (data.noibu_checkout_address_info_submitted) {
            track("checkout_address_info_submitted", data.noibu_checkout_address_info_submitted);
            track("checkout_shipping_info_submitted", data.noibu_checkout_shipping_info_submitted);
        }
        if (data.noibu_payment_info_submitted) {
            track("payment_info_submitted", data.noibu_payment_info_submitted);
        }
    });
}

async function track(eventName, eventData) {
    if (!window.NOIBUJS) {
        await new Promise(resolve => window.addEventListener("noibuSDKReady", resolve));
    }

    const result = NOIBUJS.track(eventName, eventData);
}

checkSDKExistanceAndAddCustomAttribute();
monitorEcommerceEvents();

/******/ })()
;