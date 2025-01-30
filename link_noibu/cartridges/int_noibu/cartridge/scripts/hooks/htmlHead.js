"use strict";

var sitePreferences = require('dw/system/Site');

/**
 * Retrieves and processes the `dwsid` cookie to extract a truncated session ID.
 *
 * This function:
 * - Accesses the `dwsid` cookie from the request's HTTP cookies.
 * - Truncates the session ID to the first 10 characters if it exists and is valid.
 * - Logs a warning if the cookie is missing, empty, or invalid.
 * - Stores the truncated session ID in a model object and renders it into a template.
 * - Handles any errors that occur during template rendering and logs them.
 *
 * @function getCookie
 * @returns {string} Rendered HTML string containing the truncated `dwsid` session ID.
 */
function getCookie() {
    var Logger = require('dw/system/Logger');
    var Template = require('dw/util/Template');
    var HashMap = require('dw/util/HashMap');

    try {
        var model = new HashMap();
        var dwsidCookie = request.httpCookies['dwsid']; // eslint-disable-line
        var truncatedSessionId;

        if (dwsidCookie && dwsidCookie.value && !empty(dwsidCookie.value)) {
            // Extract and truncate the dwsid value
            truncatedSessionId = dwsidCookie.value.substring(0, 10);
        } else {
            Logger.warn('dwsid cookie is missing, empty, or does not have a value property.');
        }

        model.dwsid = truncatedSessionId || '';
        return new Template('/noibu/include/noibuInclude').render(model).text;
    } catch (e) {
        Logger.error('Error while rendering the template /noibuSDK: {0}', e.message);
        return '';
    }
}

/**
 * Extended hook due to Handle Noibu session ID retrieval and stores a truncated value in session privacy.
 *
 * - Checks if the `isNoibuEnabled` flag is enabled in site preferences.
 * - Iterates through HTTP cookies to find the `dwsid` cookie.
 * - Truncates the session ID to the first 10 characters.
 * - Stores the truncated session ID in `session.privacy.dwsid` if not already set.
 *
 * @function htmlHead
 * @returns {void} This function does not return a value.
 */
function htmlHead() {
    if ("noibuEnabled" in sitePreferences.current.preferences.custom && sitePreferences.current.preferences.custom.noibuEnabled) {
        return getCookie();
    }
    return '';
}

exports.htmlHead = htmlHead;
