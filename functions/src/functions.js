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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.deleteAllProperties = exports.createNewRextimatePrice = exports.calculateNewRextimate = exports.setFPBInFirebase = exports.setPositionInFirebase = exports.updateFPBsWithPropertyStatus = exports.updatePositionsWithPropertyStatus = exports.statusWasUpdated = exports.getProperty = exports.setPropertyInFirebase = exports.resizeImage = exports.downloadAllImages = exports.isNewOrExcellent = exports.pullSoldProperties = exports.pullPendingProperties = exports.getFinalizedForSaleProperties = exports.pullNewProperties = void 0;
var axios_1 = require("axios");
var sharp = require("sharp");
var axios_2 = require("./axios");
var cloudinary_1 = require("./cloudinary");
var firebase_1 = require("./firebase");
var yesterday_1 = require("./yesterday");
var pullNewProperties = function () { return __awaiter(void 0, void 0, void 0, function () {
    var properties;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_2.homeJunctionClient
                    .get("listings/search?market=GSREIN&listingType=residential&status=active&propertyType=detached&listingDate=>=".concat(yesterday_1.yesterday, "&listPrice=250000:700000&address.zip=70119,70118,70122,70124,70115&images=true&pageSize=1000&extended=true&details=true&features=true"))
                    .then(function (res) { return res.data.result.listings; })];
            case 1:
                properties = _a.sent();
                return [2 /*return*/, properties];
        }
    });
}); };
exports.pullNewProperties = pullNewProperties;
var getFinalizedForSaleProperties = function (properties) { return __awaiter(void 0, void 0, void 0, function () {
    var finalizedProperties, _i, properties_1, property, hasRightQuality, propertyWithImages, propertyWithInitializedData;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                finalizedProperties = [];
                _i = 0, properties_1 = properties;
                _a.label = 1;
            case 1:
                if (!(_i < properties_1.length)) return [3 /*break*/, 4];
                property = properties_1[_i];
                hasRightQuality = (0, exports.isNewOrExcellent)(property) && hasImages(property);
                console.log({ propertyImages: property.images.length });
                if (!hasRightQuality) return [3 /*break*/, 3];
                return [4 /*yield*/, resizeImagesAndUploadToCloudinary(property)];
            case 2:
                propertyWithImages = _a.sent();
                propertyWithInitializedData = getFormattedForSaleProperty(propertyWithImages);
                finalizedProperties.push(propertyWithInitializedData);
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, finalizedProperties];
        }
    });
}); };
exports.getFinalizedForSaleProperties = getFinalizedForSaleProperties;
var pullPendingProperties = function () { return __awaiter(void 0, void 0, void 0, function () {
    var properties;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_2.homeJunctionClient
                    .get("listings/search?market=GSREIN&listingType=residential&status=Pending&propertyType=detached&pageSize=1000&listPrice=250000:700000&address.zip=70119,70118,70122,70124,70115")
                    .then(function (res) { return res.data.result.listings; })];
            case 1:
                properties = _a.sent();
                return [2 /*return*/, properties];
        }
    });
}); };
exports.pullPendingProperties = pullPendingProperties;
var pullSoldProperties = function () { return __awaiter(void 0, void 0, void 0, function () {
    var properties;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_2.homeJunctionClient
                    .get("sales/search?market=GSREIN&saleDate=>=".concat(yesterday_1.yesterday, "&zip=70119,70118,70122,70124,70115&propertyType=single&pageSize=1000"))
                    .then(function (res) { return res.data.result.sales; })];
            case 1:
                properties = _a.sent();
                return [2 /*return*/, properties];
        }
    });
}); };
exports.pullSoldProperties = pullSoldProperties;
var isNewOrExcellent = function (property) {
    var conditionArray = property.xf_propertycondition;
    for (var i = 0; i < conditionArray.length; i++) {
        var condition = conditionArray[i].toLowerCase();
        if (condition.includes('new') ||
            condition.includes('excellent') ||
            condition.includes('very good')) {
            return true;
        }
    }
    return false;
};
exports.isNewOrExcellent = isNewOrExcellent;
var hasImages = function (property) {
    return property.imageCount > 0;
};
var resizeImagesAndUploadToCloudinary = function (property) { return __awaiter(void 0, void 0, void 0, function () {
    var images, i, resized, uploadResult, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                images = property.images;
                property.cloudinaryImages = [];
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < images.length)) return [3 /*break*/, 7];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 5, , 6]);
                console.log(images[i]);
                return [4 /*yield*/, (0, exports.resizeImage)(images[i])];
            case 3:
                resized = _a.sent();
                return [4 /*yield*/, uploadToCloudinary(resized)];
            case 4:
                uploadResult = _a.sent();
                property.cloudinaryImages.push(uploadResult);
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.log(JSON.stringify(error_1));
                return [3 /*break*/, 6];
            case 6:
                i++;
                return [3 /*break*/, 1];
            case 7:
                console.log({ cloudinaryImages: property.cloudinaryImages.length });
                return [2 /*return*/, property];
        }
    });
}); };
var downloadAllImages = function (images) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1["default"].all(images.map(function (endpoint) {
                    return axios_1["default"].get(endpoint, { responseType: 'arraybuffer' });
                }))];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.downloadAllImages = downloadAllImages;
var resizeImage = function (image) { return __awaiter(void 0, void 0, void 0, function () {
    var input, output;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, axios_1["default"])(image, {
                    responseType: 'arraybuffer',
                    headers: {
                        ContentType: 'application/json'
                    }
                }).then(function (res) { return res.data; })];
            case 1:
                input = _a.sent();
                console.log({ input: input });
                return [4 /*yield*/, sharp(input).resize(800).toBuffer()];
            case 2:
                output = _a.sent();
                return [2 /*return*/, output];
        }
    });
}); };
exports.resizeImage = resizeImage;
var uploadToCloudinary = function (image) { return __awaiter(void 0, void 0, void 0, function () {
    var results;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, cloudinary_1.streamUpload)(image)];
            case 1:
                results = _a.sent();
                return [2 /*return*/, results];
        }
    });
}); };
var getFormattedForSaleProperty = function (property) {
    var _a, _b, _c, _d, _e;
    var formattedProperty = __assign(__assign({}, property), { isActive: true, dateCreated: Date.now(), deleted: false, zipCode: (_a = property === null || property === void 0 ? void 0 : property.address) === null || _a === void 0 ? void 0 : _a.zip, deliveryLine: (_b = property === null || property === void 0 ? void 0 : property.address) === null || _b === void 0 ? void 0 : _b.deliveryLine, city: (_c = property === null || property === void 0 ? void 0 : property.address) === null || _c === void 0 ? void 0 : _c.city, state: (_d = property === null || property === void 0 ? void 0 : property.address) === null || _d === void 0 ? void 0 : _d.state, street: (_e = property === null || property === void 0 ? void 0 : property.address) === null || _e === void 0 ? void 0 : _e.street, offMarket: false });
    return formattedProperty;
};
var setPropertyInFirebase = function (property) { return __awaiter(void 0, void 0, void 0, function () {
    var formattedProperty, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                formattedProperty = getFormattedForSaleProperty(property);
                return [4 /*yield*/, firebase_1.propertiesCollection
                        .doc(property.id)
                        .set(formattedProperty, { merge: true })];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                // TODO send an email if this fails
                // sentry?
                console.log(JSON.stringify(error_2));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.setPropertyInFirebase = setPropertyInFirebase;
var getProperty = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var property;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, firebase_1.propertiesCollection
                    .doc(id)
                    .get()
                    .then(function (res) { return res === null || res === void 0 ? void 0 : res.data(); })];
            case 1:
                property = _a.sent();
                return [2 /*return*/, property];
        }
    });
}); };
exports.getProperty = getProperty;
var statusWasUpdated = function (beforeProperty, afterProperty) {
    return beforeProperty.status != afterProperty.status;
};
exports.statusWasUpdated = statusWasUpdated;
var updatePositionsWithPropertyStatus = function (property) { return __awaiter(void 0, void 0, void 0, function () {
    var querySnapshot, positions, _i, positions_1, position;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, firebase_1.positionsCollection
                    .where('mlsId', '==', property.id)
                    .get()];
            case 1:
                querySnapshot = _a.sent();
                positions = __spreadArray([], querySnapshot.docs, true);
                _i = 0, positions_1 = positions;
                _a.label = 2;
            case 2:
                if (!(_i < positions_1.length)) return [3 /*break*/, 5];
                position = positions_1[_i];
                return [4 /*yield*/, (0, exports.setPositionInFirebase)(__assign(__assign({}, position.data()), { propertyStatus: property.status }), position.ref.id)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.updatePositionsWithPropertyStatus = updatePositionsWithPropertyStatus;
var updateFPBsWithPropertyStatus = function (property) { return __awaiter(void 0, void 0, void 0, function () {
    var querySnapshot, fpbs, _i, fpbs_1, bid;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, firebase_1.fpbsCollection
                    .where('mlsId', '==', property.id)
                    .get()];
            case 1:
                querySnapshot = _a.sent();
                fpbs = __spreadArray([], querySnapshot.docs, true);
                _i = 0, fpbs_1 = fpbs;
                _a.label = 2;
            case 2:
                if (!(_i < fpbs_1.length)) return [3 /*break*/, 5];
                bid = fpbs_1[_i];
                return [4 /*yield*/, (0, exports.setFPBInFirebase)(__assign(__assign({}, bid.data()), { propertyStatus: property.status }), bid.ref.id)];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.updateFPBsWithPropertyStatus = updateFPBsWithPropertyStatus;
var setPositionInFirebase = function (position, id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, firebase_1.positionsCollection.doc(id).set(position, { merge: true })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.setPositionInFirebase = setPositionInFirebase;
var setFPBInFirebase = function (fpb, id) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, firebase_1.fpbsCollection.doc(id).set(fpb, { merge: true })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.setFPBInFirebase = setFPBInFirebase;
var calculateNewRextimate = function (mlsId, type) { return __awaiter(void 0, void 0, void 0, function () {
    var tooHighPositions, tooLowPositions, justRightPositions, currentRextimate, direction, newRextimate;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, firebase_1.positionsCollection
                    .where('type', '==', 1)
                    .where('mlsId', '==', mlsId)
                    .get()
                    .then(function (res) { return res.docs; })];
            case 1:
                tooHighPositions = _a.sent();
                return [4 /*yield*/, firebase_1.positionsCollection
                        .where('type', '==', 0)
                        .where('mlsId', '==', mlsId)
                        .get()
                        .then(function (res) { return res.docs; })];
            case 2:
                tooLowPositions = _a.sent();
                return [4 /*yield*/, firebase_1.positionsCollection
                        .where('type', '==', 2)
                        .where('mlsId', '==', mlsId)
                        .get()
                        .then(function (res) { return res.docs; })];
            case 3:
                justRightPositions = _a.sent();
                return [4 /*yield*/, getCurrentRextimate(mlsId)];
            case 4:
                currentRextimate = _a.sent();
                direction = type === 0 ? 1 : type === 1 ? -1 : 0;
                newRextimate = Math.round(currentRextimate +
                    (currentRextimate * direction) /
                        (100 +
                            tooHighPositions.length +
                            tooLowPositions.length +
                            justRightPositions.length));
                return [2 /*return*/, newRextimate];
        }
    });
}); };
exports.calculateNewRextimate = calculateNewRextimate;
var getCurrentRextimate = function (mlsId) { return __awaiter(void 0, void 0, void 0, function () {
    var currentRextimate;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, firebase_1.rextimatePriceHistoriesCollection
                    .where('mlsId', '==', mlsId)
                    .limit(1)
                    .orderBy('dateCreated', 'desc')
                    .get()
                    .then(function (res) { var _a; return (_a = res.docs[0]) === null || _a === void 0 ? void 0 : _a.data().amount; })];
            case 1:
                currentRextimate = _a.sent();
                return [2 /*return*/, currentRextimate];
        }
    });
}); };
var createNewRextimatePrice = function (mlsId, amount) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, firebase_1.rextimatePriceHistoriesCollection.add({
                amount: amount,
                mlsId: mlsId,
                dateCreated: Date.now()
            })];
    });
}); };
exports.createNewRextimatePrice = createNewRextimatePrice;
var deleteAllProperties = function () { return __awaiter(void 0, void 0, void 0, function () {
    var querySnapshot;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, firebase_1.propertiesCollection.get()];
            case 1:
                querySnapshot = _a.sent();
                querySnapshot.forEach(function (doc) { return doc.ref["delete"](); });
                return [2 /*return*/];
        }
    });
}); };
exports.deleteAllProperties = deleteAllProperties;
