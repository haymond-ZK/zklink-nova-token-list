"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadABI = void 0;
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("src/logger");
/**
 * Loads an ABI from a file
 * @param abiPath
 * @returns
 */
const loadABI = (abiPath) => {
    try {
        const abi = JSON.parse(fs_1.default.readFileSync(abiPath).toString());
        return abi;
    }
    catch (error) {
        logger_1.logger.error('Error loading ABI', { from: abiPath }, { error });
        throw error;
    }
};
exports.loadABI = loadABI;
