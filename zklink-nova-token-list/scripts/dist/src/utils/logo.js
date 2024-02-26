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
exports.fetchCoinGeckoLogoURI = exports.fetchCoinMarketCapLogoURI = exports.fetchLogoURI = exports.CryptoService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = require("src/config");
const logger_1 = require("src/logger");
const ethers_1 = require("ethers");
var CryptoService;
(function (CryptoService) {
    CryptoService["COINGECKO"] = "CoinGecko";
    CryptoService["COINMARKETCAP"] = "CoinMarketCap";
})(CryptoService || (exports.CryptoService = CryptoService = {}));
const fetchLogoURI = (token, service) => __awaiter(void 0, void 0, void 0, function* () {
    switch (service) {
        case CryptoService.COINGECKO:
            return (0, exports.fetchCoinGeckoLogoURI)(token);
        case CryptoService.COINMARKETCAP:
            return (0, exports.fetchCoinMarketCapLogoURI)(token);
        default:
            logger_1.logger.error('Unsupported service', { service });
            return null;
    }
});
exports.fetchLogoURI = fetchLogoURI;
/**
 * Fetch the logo URI from CoinMarketCap.
 * @param tokenInfo
 * @returns
 */
const fetchCoinMarketCapLogoURI = (tokenInfo) => __awaiter(void 0, void 0, void 0, function* () {
    const { COINMARKETCAP_URL, ETHEREUM_MAINNET_CHAIN_ID } = config_1.config;
    const { chainId, address, extension } = tokenInfo;
    const tokenAddress = chainId === ETHEREUM_MAINNET_CHAIN_ID ? address : extension === null || extension === void 0 ? void 0 : extension.rootAddress;
    if (!tokenAddress) {
        logger_1.logger.warn('No token address provided', { tokenInfo });
        return null;
    }
    const normalizedAddress = ethers_1.utils.getAddress(tokenAddress); // Assuming utils.getAddress is a function that normalizes/validates the address.
    try {
        const url = new URL('/v2/cryptocurrency/info', COINMARKETCAP_URL);
        const response = yield axios_1.default.get(url.toString(), {
            params: {
                address: tokenAddress,
            },
            headers: {
                'X-CMC_PRO_API_KEY': config_1.config.COINMARKETCAP_API_KEY,
            },
            timeout: 5000,
        });
        return response.data.logo;
    }
    catch (error) {
        handleFetchingError(error, normalizedAddress, COINMARKETCAP_URL);
        return null;
    }
});
exports.fetchCoinMarketCapLogoURI = fetchCoinMarketCapLogoURI;
/**
 * Fetch the logo URI from CoinGecko.
 * @param token
 * @returns
 */
const fetchCoinGeckoLogoURI = (token) => __awaiter(void 0, void 0, void 0, function* () {
    const { COINGECKO_URL, ETHEREUM_MAINNET_CHAIN_ID } = config_1.config;
    const { chainId, address, extension } = token;
    const tokenAddress = chainId === ETHEREUM_MAINNET_CHAIN_ID ? address : extension === null || extension === void 0 ? void 0 : extension.rootAddress;
    if (!tokenAddress) {
        logger_1.logger.warn('No token address provided', { token });
        return null;
    }
    const normalizedAddress = ethers_1.utils.getAddress(tokenAddress); // Assuming utils.getAddress is a function that normalizes/validates the address.
    try {
        const url = new URL(normalizedAddress.toLowerCase(), COINGECKO_URL);
        const response = yield axios_1.default.get(url.toString());
        return response.data.image.large;
    }
    catch (error) {
        handleFetchingError(error, normalizedAddress, COINGECKO_URL);
        return null;
    }
});
exports.fetchCoinGeckoLogoURI = fetchCoinGeckoLogoURI;
/**
 * Handle errors during data fetching.
 * @param error The thrown error during fetching.
 * @param tokenAddress The address of the token being fetched.
 * @param baseURL The base URL being used to fetch.
 */
const handleFetchingError = (error, tokenAddress, baseURL) => {
    if (axios_1.default.isAxiosError(error)) {
        const { status, data } = error.response || {};
        if (status === 429) {
            const rateErrorMessage = 'Rate limit reached';
            logger_1.logger.warn(rateErrorMessage);
            throw new Error(rateErrorMessage);
        }
        else {
            logger_1.logger.warn('Error fetching logoURI', {
                tokenAddress,
                baseURL,
                errorMessage: error.message,
                responseData: data,
            });
        }
    }
    else if (error instanceof TypeError) {
        logger_1.logger.error('Error constructing URL', { tokenAddress, baseURL });
    }
    else {
        logger_1.logger.error('An unexpected error occurred while fetching data', { tokenAddress, error });
    }
};
