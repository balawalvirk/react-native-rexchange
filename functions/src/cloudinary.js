"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.streamUpload = void 0;
var cloudinary_1 = require("cloudinary");
var streamifier = require("streamifier");
var functions = require("firebase-functions");
var config_1 = require("./config");
var config = JSON.stringify(functions.config()) != '{}' ? functions.config() : config_1.fbConfig;
cloudinary_1.v2.config({
    cloud_name: config.cloudname.key,
    api_key: config.cloudinary_api.key,
    api_secret: config.cloudinary_secret.key
});
var streamUpload = function (data, id) {
    return new Promise(function (resolve, reject) {
        var options = __assign({ folder: config.cloudinary_folder.key || 'default', invalidate: true }, (id && { public_id: id, folder: null }));
        var stream = cloudinary_1.v2.uploader.upload_stream(options, function (error, result) {
            if (result) {
                resolve(result);
            }
            else {
                reject(error);
            }
        });
        streamifier.createReadStream(data).pipe(stream);
    });
};
exports.streamUpload = streamUpload;
