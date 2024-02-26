"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTokenErrors = exports.updateTokenListIfNeeded = exports.checkTokenExists = exports.fetchTokenInfo = exports.getEventTokenAddresses = void 0;
const ethers_1 = require("ethers");
const deep_diff_1 = __importDefault(require("deep-diff"));
const lodash_1 = __importDefault(require("lodash"));
const token_1 = require("src/models/token");
const logger_1 = require("src/logger");
const file_1 = require("./file");
const list_1 = require("./list");
const date_1 = require("./date");
/**
 * Returns the token address and native token address from an event
 * @param event
 * @returns
 */
const getEventTokenAddresses = (event) => {
    var _a, _b, _c;
    const tokenAddress = ((_a = event === null || event === void 0 ? void 0 : event.args) === null || _a === void 0 ? void 0 : _a.bridgedToken) && ethers_1.utils.getAddress(event.args.bridgedToken);
    const nativeTokenAddress = ((_b = event === null || event === void 0 ? void 0 : event.args) === null || _b === void 0 ? void 0 : _b.nativeToken) && ethers_1.utils.getAddress((_c = event === null || event === void 0 ? void 0 : event.args) === null || _c === void 0 ? void 0 : _c.nativeToken);
    return { tokenAddress, nativeTokenAddress };
};
exports.getEventTokenAddresses = getEventTokenAddresses;
/**
 * Fetches the token info from the contract
 * @param erc20Contract
 * @param eventName
 * @returns
 */
function fetchTokenInfo(erc20Contract, abiType) {
    return __awaiter(this, void 0, void 0, function* () {
        const [name, symbol, decimals] = yield Promise.all([
            erc20Contract.name(),
            erc20Contract.symbol(),
            erc20Contract.decimals(),
        ]);
        let parsedSymbol = symbol;
        let parsedName = name;
        // If it's an ERC20 Byte32 contract, parse bytes32 for symbol and name
        if (abiType === token_1.ABIType.BYTE32) {
            parsedName = ethers_1.utils.parseBytes32String(name);
            parsedSymbol = ethers_1.utils.parseBytes32String(symbol);
        }
        const defaultTokenInfo = {
            chainId: 0,
            chainURI: '',
            tokenId: '',
            tokenType: [],
            address: '',
            name: parsedName,
            symbol: parsedSymbol,
            decimals: Number(decimals),
            createdAt: (0, date_1.getCurrentDate)(),
            updatedAt: (0, date_1.getCurrentDate)(),
            extension: {
                rootChainId: 1,
                rootChainURI: '',
                rootAddress: ethers_1.utils.getAddress(erc20Contract.address),
            },
        };
        return defaultTokenInfo;
    });
}
exports.fetchTokenInfo = fetchTokenInfo;
/**
 * Checks if the token exists in the token list
 * @param tokenList
 * @param tokenAddress
 * @returns
 */
const checkTokenExists = (tokenList, tokenAddress) => {
    var _a;
    const token = tokenList.find((token) => token.address === tokenAddress);
    if (token && ((_a = token.extension) === null || _a === void 0 ? void 0 : _a.rootAddress)) {
        return token;
    }
    const tokenExtension = tokenList.find((token) => { var _a; return ((_a = token.extension) === null || _a === void 0 ? void 0 : _a.rootAddress) === tokenAddress; });
    if (tokenExtension && tokenExtension.address) {
        return tokenExtension;
    }
};
exports.checkTokenExists = checkTokenExists;
/**
 * Updates the token list if modifications are found
 * @param path
 * @param originalList
 * @param checkTokenList
 */
const updateTokenListIfNeeded = (path, originalList, checkTokenList) => {
    if (lodash_1.default.isEqual(originalList.tokens, checkTokenList)) {
        logger_1.logger.info('Token list matching');
    }
    else {
        const tokenList = (0, file_1.readJsonFile)(path);
        const differences = (0, deep_diff_1.default)(originalList.tokens, checkTokenList);
        const newTokenList = Object.assign(Object.assign({}, tokenList), { updatedAt: (0, date_1.getCurrentDate)(), versions: (0, list_1.getBumpedVersions)(tokenList.versions), tokens: checkTokenList });
        (0, file_1.saveJsonFile)(path, newTokenList);
        logger_1.logger.info('Token list updated', { path, differences });
    }
};
exports.updateTokenListIfNeeded = updateTokenListIfNeeded;
/**
 * Checks if the token fields match
 * @param token
 * @param verifiedToken
 */
const checkTokenErrors = (token, verifiedToken) => {
    var _a, _b, _c, _d;
    validateTokenField('address', token.address, verifiedToken.address, token.name);
    validateTokenField('rootAddress', (_a = token.extension) === null || _a === void 0 ? void 0 : _a.rootAddress, (_b = verifiedToken.extension) === null || _b === void 0 ? void 0 : _b.rootAddress, token.name);
    validateTokenField('symbol', token.symbol, verifiedToken.symbol, token.name);
    validateTokenField('decimals', token.decimals, verifiedToken.decimals, token.name);
    validateTokenField('chainId', token.chainId, verifiedToken.chainId, token.name);
    validateTokenField('rootChainId', (_c = token.extension) === null || _c === void 0 ? void 0 : _c.rootChainId, (_d = verifiedToken.extension) === null || _d === void 0 ? void 0 : _d.rootChainId, token.name);
};
exports.checkTokenErrors = checkTokenErrors;
/**
 * Compares the original token with the verified token
 * @param fieldName
 * @param originalValue
 * @param verifiedValue
 * @param tokenName
 */
const validateTokenField = (fieldName, originalValue, verifiedValue, tokenName) => {
    if (originalValue !== verifiedValue) {
        const message = `${fieldName} mismatch`;
        logger_1.logger.error(message, {
            name: tokenName,
            [`current${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`]: originalValue,
            [`new${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`]: verifiedValue,
        });
        throw new Error(message);
    }
};
