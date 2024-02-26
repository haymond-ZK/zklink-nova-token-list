"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAddress = void 0;
const ethers_1 = require("ethers");
const normalizeAddress = (addr) => {
    const paddedAddress = ethers_1.ethers.utils.hexZeroPad(addr, 20); // 20 bytes for Ethereum address
    return ethers_1.ethers.utils.getAddress(paddedAddress);
};
exports.normalizeAddress = normalizeAddress;
