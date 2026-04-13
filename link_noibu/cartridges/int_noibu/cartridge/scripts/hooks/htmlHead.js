"use strict";

var sitePreferences = require('dw/system/Site');

function htmlHead() {
    if ("noibuEnabled" in sitePreferences.current.preferences.custom && sitePreferences.current.preferences.custom.noibuEnabled) {
        var Logger = require('dw/system/Logger');
        var Template = require('dw/util/Template');
        var HashMap = require('dw/util/HashMap');

        try {
            return new Template('/noibu/include/noibuInclude').render(new HashMap()).text;
        } catch (e) {
            Logger.error('Error while rendering the template /noibuInclude: {0}', e.message);
            return '';
        }
    }
    return '';
}

exports.htmlHead = htmlHead;
