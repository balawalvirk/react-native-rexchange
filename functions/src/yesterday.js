"use strict";
exports.__esModule = true;
exports.yesterday = void 0;
var getYesterdayString = function () {
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    var yesterdayDay = formatDateString(yesterday.getDate().toString());
    var yesterdayMonth = formatDateString((yesterday.getMonth() + 1).toString());
    var yesterdayYear = formatDateString(yesterday.getFullYear().toString());
    return "".concat(yesterdayMonth, "/").concat(yesterdayDay, "/").concat(yesterdayYear);
};
var formatDateString = function (date) {
    if (date.length == 1) {
        return '0'.concat(date);
    }
    return date;
};
exports.yesterday = getYesterdayString();
