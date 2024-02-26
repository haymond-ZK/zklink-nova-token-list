"use strict";
/* istanbul ignore file */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenType = exports.ABIType = void 0;
var ABIType;
(function (ABIType) {
    ABIType["STANDARD"] = "standard";
    ABIType["BYTE32"] = "byte32";
})(ABIType || (exports.ABIType = ABIType = {}));
var TokenType;
(function (TokenType) {
    TokenType["CANONICAL_BRIDGE"] = "canonical-bridge";
    TokenType["BRIDGE_RESERVED"] = "bridge-reserved";
    TokenType["EXTERNAL_BRIDGE"] = "external-bridge";
    TokenType["NATIVE"] = "native";
})(TokenType || (exports.TokenType = TokenType = {}));
