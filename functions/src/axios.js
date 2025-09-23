"use strict";
exports.__esModule = true;
exports.homeJunctionClient = void 0;
var axios_1 = require("axios");
var functions = require("firebase-functions");
var config_1 = require("./config");
var config = JSON.stringify(functions.config()) != '{}' ? functions.config() : config_1.fbConfig;
var HOME_JUNCTION_API_KEY = config.homejunction.key;
var headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Set-Cookie': 'HttpOnly;Secure;SameSite=Strict',
    Authorization: "Bearer ".concat(HOME_JUNCTION_API_KEY)
};
exports.homeJunctionClient = axios_1["default"].create({
    baseURL: 'https://slipstream.homejunction.com/ws/',
    headers: headers
});
