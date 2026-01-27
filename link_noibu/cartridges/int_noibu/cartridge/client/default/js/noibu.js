"use strict";

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

checkSDKExistanceAndAddCustomAttribute();
