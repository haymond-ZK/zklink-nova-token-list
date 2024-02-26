"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatToken = exports.formatLineaTokenList = exports.saveJsonFile = exports.readJsonFile = void 0;
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("src/logger");
/**
 * Reads a JSON file
 * @param filePath
 * @returns
 */
const readJsonFile = (filePath) => {
    try {
        return JSON.parse(fs_1.default.readFileSync(filePath).toString());
    }
    catch (error) {
        logger_1.logger.error(`Error reading file: ${error}`);
        throw error;
    }
};
exports.readJsonFile = readJsonFile;
/**
 * Saves a JSON file
 * @param filePath
 * @param data
 */
const saveJsonFile = (filePath, data) => {
    try {
        const formattedData = (0, exports.formatLineaTokenList)(data);
        fs_1.default.writeFileSync(filePath, JSON.stringify(formattedData, null, 2));
    }
    catch (error) {
        logger_1.logger.error(`Error writing file: ${error}`);
        throw error;
    }
};
exports.saveJsonFile = saveJsonFile;
/**
 * Orders the properties of a LineaTokenList object, including nested Token objects
 * @param list
 * @returns
 */
const formatLineaTokenList = (list) => {
    return {
        type: list.type,
        tokenListId: list.tokenListId,
        name: list.name,
        createdAt: list.createdAt,
        updatedAt: list.updatedAt,
        versions: list.versions,
        tokens: list.tokens.map(exports.formatToken),
    };
};
exports.formatLineaTokenList = formatLineaTokenList;
const formatToken = (token) => {
    return {
        chainId: token.chainId,
        chainURI: token.chainURI,
        tokenId: token.tokenId,
        tokenType: token.tokenType,
        address: token.address,
        name: token.name,
        symbol: token.symbol,
        decimals: token.decimals,
        createdAt: token.createdAt,
        updatedAt: token.updatedAt,
        logoURI: token.logoURI,
        extension: token.extension && {
            rootChainId: token.extension.rootChainId,
            rootChainURI: token.extension.rootChainURI,
            rootAddress: token.extension.rootAddress,
        },
    };
};
exports.formatToken = formatToken;
