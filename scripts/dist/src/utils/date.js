"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentDate = void 0;
const date_fns_1 = require("date-fns");
/**
 * Returns the current date in the format yyyy-MM-dd
 * @returns
 */
const getCurrentDate = () => {
    return (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd');
};
exports.getCurrentDate = getCurrentDate;
