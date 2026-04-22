'use strict';

var Logger = require("dw/system/Logger");
var log = Logger.getLogger("noibu", "noibu");

module.exports = function safe(callback) {
    try {
        callback();
    } catch (error) {
        log.error("noibu error: {0}", error);
    }
};
