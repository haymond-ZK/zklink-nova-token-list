"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = require("winston");
const package_json_1 = require("root/package.json");
const isDevMode = process.env.NODE_ENV === 'development';
const customFormat = winston_1.format.printf((_a) => {
    var { level, message, timestamp, service } = _a, metadata = __rest(_a, ["level", "message", "timestamp", "service"]);
    const metaString = Object.keys(metadata).length ? JSON.stringify(metadata, null) : '';
    return `${level} ${timestamp} (${service}): ${message}${metaString ? `\n\t${metaString}` : ''}`;
});
const logger = (0, winston_1.createLogger)({
    level: 'info',
    format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }), isDevMode ? customFormat : winston_1.format.json()),
    defaultMeta: { service: package_json_1.name },
    transports: [
        new winston_1.transports.Console({
            format: isDevMode ? winston_1.format.combine(winston_1.format.colorize(), customFormat) : winston_1.format.json(),
        }),
    ],
});
exports.logger = logger;
