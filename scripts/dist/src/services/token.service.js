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
exports.TokenService = void 0;
const ethers_1 = require("ethers");
const lodash_1 = __importDefault(require("lodash"));
const token_1 = require("src/models/token");
const abi_1 = require("src/utils/abi");
const config_1 = require("src/config");
const logger_1 = require("src/logger");
const token_2 = require("src/utils/token");
const date_1 = require("src/utils/date");
const file_1 = require("src/utils/file");
const list_1 = require("src/utils/list");
const logo_1 = require("src/utils/logo");
const ethereum_1 = require("src/utils/ethereum");
const RESERVED_STATUS = (0, ethereum_1.normalizeAddress)('0x111');
const VERIFY_BATCH_SIZE = 10;
/**
 * Discover ERC20 tokens by processing the Canonical Token Bridge events
 */
class TokenService {
    constructor(l1Provider, l2Provider, existingTokenList) {
        this.l1Provider = l1Provider;
        this.l2Provider = l2Provider;
        this.existingTokenList = existingTokenList;
        this.tokenList = [];
        // Load contract ABIs
        const contractABI = (0, abi_1.loadABI)(config_1.config.TOKEN_BRIDGE_ABI_PATH);
        this.erc20ContractABI = (0, abi_1.loadABI)(config_1.config.ERC20_ABI_PATH);
        this.erc20Byte32ContractABI = (0, abi_1.loadABI)(config_1.config.ERC20_BYTE32_ABI_PATH);
        // Instantiate contracts
        this.l1Contract = new ethers_1.Contract(config_1.config.L1_TOKEN_BRIDGE_ADDRESS, contractABI, l1Provider);
        this.l2Contract = new ethers_1.Contract(config_1.config.L2_TOKEN_BRIDGE_ADDRESS, contractABI, l2Provider);
    }
    /**
     * Processes the token events
     */
    processTokenEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            const newTokenDeployedL1EventFilter = this.l1Contract.filters.NewTokenDeployed();
            const newTokenDeployedL2EventFilter = this.l2Contract.filters.NewTokenDeployed();
            const rawL1Events = yield this.l1Contract.queryFilter(newTokenDeployedL1EventFilter);
            const rawL2Events = yield this.l2Contract.queryFilter(newTokenDeployedL2EventFilter);
            // Add chainId to events
            const newTokenDeployedL1Events = rawL1Events.map((event) => (Object.assign(Object.assign({}, event), { chainId: config_1.config.ETHEREUM_MAINNET_CHAIN_ID })));
            const newTokenDeployedL2Events = rawL2Events.map((event) => (Object.assign(Object.assign({}, event), { chainId: config_1.config.LINEA_MAINNET_CHAIN_ID })));
            const events = [...newTokenDeployedL1Events, ...newTokenDeployedL2Events];
            for (const event of events) {
                try {
                    const token = yield this.processTokenEvent(event);
                    if (token) {
                        logger_1.logger.info('Add new token', { name: token.name });
                        this.tokenList.push(token);
                    }
                }
                catch (error) {
                    logger_1.logger.error('Error processing token event, skip', { error });
                }
            }
        });
    }
    /**
     * Gets the contract with the ERC20 ABI or the ERC20 Byte32 ABI
     * @param tokenAddress
     * @param chainId
     * @returns
     */
    getContractWithRetry(tokenAddress, chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = chainId === config_1.config.ETHEREUM_MAINNET_CHAIN_ID ? this.l1Provider : this.l2Provider;
            try {
                const erc20Contract = new ethers_1.Contract(tokenAddress, this.erc20ContractABI, provider);
                return yield (0, token_2.fetchTokenInfo)(erc20Contract, token_1.ABIType.STANDARD);
            }
            catch (error) {
                logger_1.logger.warn('Error fetching token info with ERC20 ABI', { address: tokenAddress, error });
                try {
                    const erc20AltContract = new ethers_1.Contract(tokenAddress, this.erc20Byte32ContractABI, provider);
                    return yield (0, token_2.fetchTokenInfo)(erc20AltContract, token_1.ABIType.BYTE32);
                }
                catch (error) {
                    logger_1.logger.error('Error fetching token info with ERC20 Byte32 ABI', { address: tokenAddress, error });
                    return;
                }
            }
        });
    }
    /**
     * Processes the token event
     * @param event
     * @returns
     */
    processTokenEvent(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tokenAddress, nativeTokenAddress } = (0, token_2.getEventTokenAddresses)(event);
            const tokenExists = (0, token_2.checkTokenExists)(this.existingTokenList.tokens, tokenAddress);
            if (tokenExists) {
                logger_1.logger.info('Token already exists', { name: tokenExists.name, tokenAddress });
                return tokenExists;
            }
            else {
                logger_1.logger.info('New token found', { tokenAddress });
            }
            let token = yield this.getContractWithRetry(tokenAddress, event.chainId);
            if (token) {
                token = this.updateTokenInfo(token, event.chainId, tokenAddress, nativeTokenAddress, [
                    token_1.TokenType.CANONICAL_BRIDGE,
                ]);
                token = yield this.fetchAndAssignTokenLogo(token);
                logger_1.logger.info('ERC20 info fetched', { token });
                return token;
            }
        });
    }
    /**
     * Updates the token info based on the event
     * @param token
     * @param event
     * @param tokenAddress
     * @param nativeTokenAddress
     * @returns
     */
    updateTokenInfo(token, chainId, tokenAddress, nativeTokenAddress, tokenTypes) {
        token.address = tokenAddress;
        token.tokenType = tokenTypes;
        if (chainId === config_1.config.LINEA_MAINNET_CHAIN_ID) {
            token.chainId = config_1.config.LINEA_MAINNET_CHAIN_ID;
            token.chainURI = 'https://lineascan.build/block/0';
            token.tokenId = `https://lineascan.build/address/${tokenAddress}`;
            if (nativeTokenAddress && token.extension) {
                token.extension.rootChainId = config_1.config.ETHEREUM_MAINNET_CHAIN_ID;
                token.extension.rootChainURI = 'https://etherscan.io/block/0';
                token.extension.rootAddress = nativeTokenAddress;
            }
        }
        else {
            token.chainId = config_1.config.ETHEREUM_MAINNET_CHAIN_ID;
            token.chainURI = 'https://etherscan.io/block/0';
            token.tokenId = `https://etherscan.io/address/${tokenAddress}`;
            if (nativeTokenAddress && token.extension) {
                token.extension.rootChainId = config_1.config.LINEA_MAINNET_CHAIN_ID;
                token.extension.rootChainURI = 'https://lineascan.build/block/0';
                token.extension.rootAddress = nativeTokenAddress;
            }
        }
        return token;
    }
    /**
     * Fetches the token logo from CoinGecko
     * @param token
     * @returns
     */
    fetchAndAssignTokenLogo(token) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const logoURIfromCoinGecko = yield (0, logo_1.fetchLogoURI)(token, logo_1.CryptoService.COINGECKO);
                if (logoURIfromCoinGecko) {
                    token.logoURI = logoURIfromCoinGecko;
                }
                return token;
            }
            catch (error) {
                logger_1.logger.warn('Error fetching logoURI, skip token until next script execution', {
                    name: token.name,
                });
                return undefined;
            }
        });
    }
    /**
     * Adds tokens from the token short list to the token list
     * @param tokenShortList
     */
    concatTokenShortList(tokenShortList) {
        for (const newToken of tokenShortList.tokens) {
            const tokenAddress = ethers_1.utils.getAddress(newToken.address);
            const existingTokenIndex = this.tokenList.findIndex((existingToken) => ethers_1.utils.getAddress(existingToken.address) === tokenAddress);
            // If token exists and is not equal to newToken, replace it.
            // If not exists, add it to the list.
            if (existingTokenIndex !== -1 && !lodash_1.default.isEqual(this.tokenList[existingTokenIndex], newToken)) {
                this.tokenList[existingTokenIndex] = newToken;
            }
            else if (existingTokenIndex === -1) {
                this.tokenList.push(newToken);
            }
        }
    }
    /**
     * Sorts the token list alphabetically and saves it to the token list file
     */
    exportTokenList() {
        this.tokenList = (0, list_1.sortAlphabetically)(this.tokenList);
        if (lodash_1.default.isEqual(this.existingTokenList.tokens, this.tokenList)) {
            logger_1.logger.info('No new tokens to add');
            return;
        }
        const newTokenList = Object.assign(Object.assign({}, this.existingTokenList), { updatedAt: (0, date_1.getCurrentDate)(), versions: (0, list_1.getBumpedVersions)(this.existingTokenList.versions), tokens: this.tokenList });
        newTokenList.tokens = (0, list_1.sortAlphabetically)(newTokenList.tokens);
        (0, file_1.saveJsonFile)(config_1.config.TOKEN_FULL_LIST_PATH, newTokenList);
        logger_1.logger.info('Token list updated', {
            path: config_1.config.TOKEN_FULL_LIST_PATH,
            previousTokenCounter: this.existingTokenList.tokens.length,
            newTokenCounter: newTokenList.tokens.length,
        });
    }
    /**
     * Verifies the token list
     * @param path
     */
    verifyList(path) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.logger.info('Verify list', { path });
            const tokenList = (0, file_1.readJsonFile)(path);
            const checkTokenList = JSON.parse(JSON.stringify(tokenList.tokens));
            const verifyTokenInBatch = (token, index) => __awaiter(this, void 0, void 0, function* () {
                logger_1.logger.info('Checking token', { name: token.name, position: `${index + 1}/${checkTokenList.length}` });
                const verifiedToken = yield this.verifyToken(token);
                if (!verifiedToken) {
                    throw new Error('Token not found');
                }
                (0, token_2.checkTokenErrors)(token, verifiedToken);
                if (token.tokenId !== verifiedToken.tokenId) {
                    logger_1.logger.warn('tokenId mismatch', {
                        name: token.name,
                        currentTokennTokenId: token.tokenId,
                        newTokenTokenId: verifiedToken.tokenId,
                    });
                    token.tokenId = verifiedToken.tokenId;
                }
                if (!lodash_1.default.isEqual(token.tokenType, verifiedToken.tokenType)) {
                    logger_1.logger.warn('Token type mismatch', {
                        name: token.name,
                        currentTokenType: token.tokenType,
                        newTokenType: verifiedToken.tokenType,
                    });
                    token.tokenType = verifiedToken.tokenType;
                }
            });
            for (let i = 0; i < checkTokenList.length; i += VERIFY_BATCH_SIZE) {
                // Get the next batch of tokens
                const tokenBatch = checkTokenList.slice(i, i + VERIFY_BATCH_SIZE);
                // Process each token in the batch in parallel and wait for all to finish
                yield Promise.all(tokenBatch.map((token, j) => verifyTokenInBatch(token, i + j)));
            }
            (0, token_2.updateTokenListIfNeeded)(path, tokenList, checkTokenList);
        });
    }
    /**
     * Get a verified token by chainId
     * @param token
     * @returns
     */
    verifyToken(token) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            let verifiedToken = {};
            switch (token.chainId) {
                case config_1.config.ETHEREUM_MAINNET_CHAIN_ID:
                    throw new Error('ChainId not supported yet');
                case config_1.config.LINEA_MAINNET_CHAIN_ID:
                    try {
                        if (!((_a = token.extension) === null || _a === void 0 ? void 0 : _a.rootAddress)) {
                            verifiedToken = yield this.verifyWithoutRootAddress(token, verifiedToken);
                        }
                        else {
                            verifiedToken = yield this.verifyWithRootAddress(token, verifiedToken);
                        }
                    }
                    catch (error) {
                        logger_1.logger.error('Error checking token', { name: token.name, error });
                        throw error;
                    }
                    break;
                default:
                    throw new Error('Invalid chainId');
            }
            if (verifiedToken && token.tokenType.includes('external-bridge')) {
                verifiedToken.tokenType.push('external-bridge');
            }
            return verifiedToken;
        });
    }
    /**
     * Verifies the token without a root address
     * @param token
     * @param verifiedToken
     * @returns
     */
    verifyWithoutRootAddress(token, verifiedToken) {
        return __awaiter(this, void 0, void 0, function* () {
            verifiedToken = yield this.getContractWithRetry(token.address, config_1.config.LINEA_MAINNET_CHAIN_ID);
            if (verifiedToken) {
                verifiedToken = this.updateTokenInfo(verifiedToken, config_1.config.LINEA_MAINNET_CHAIN_ID, token.address, undefined, [
                    token_1.TokenType.NATIVE,
                ]);
                delete verifiedToken.extension;
            }
            return verifiedToken;
        });
    }
    /**
     * Verifies the token with a root address
     * @param token
     * @param verifiedToken
     * @returns
     */
    verifyWithRootAddress(token, verifiedToken) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!((_a = token.extension) === null || _a === void 0 ? void 0 : _a.rootAddress)) {
                throw new Error('Extension or rootAddress is undefined');
            }
            const tokenAddress = ethers_1.utils.getAddress(token.extension.rootAddress);
            const l1nativeToBridgedToken = yield this.l1Contract.nativeToBridgedToken(1, tokenAddress);
            const l2nativeToBridgedToken = yield this.l2Contract.nativeToBridgedToken(1, tokenAddress);
            if (l1nativeToBridgedToken === RESERVED_STATUS) {
                verifiedToken = yield this.getVerifiedTokenInfo(token, verifiedToken, [token_1.TokenType.BRIDGE_RESERVED]);
            }
            else if (l2nativeToBridgedToken !== ethers_1.constants.AddressZero) {
                verifiedToken = yield this.getVerifiedTokenInfo(token, verifiedToken, [token_1.TokenType.CANONICAL_BRIDGE]);
            }
            return verifiedToken;
        });
    }
    /**
     * Verifies the token with a reserved status or with a non-zero bridged token
     * @param token
     * @param verifiedToken
     * @param tokenTypes
     * @returns
     */
    getVerifiedTokenInfo(token, verifiedToken, tokenTypes) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            verifiedToken = yield this.getContractWithRetry(token.address, config_1.config.LINEA_MAINNET_CHAIN_ID);
            if (verifiedToken) {
                verifiedToken = this.updateTokenInfo(verifiedToken, config_1.config.LINEA_MAINNET_CHAIN_ID, token.address, (_a = token.extension) === null || _a === void 0 ? void 0 : _a.rootAddress, tokenTypes);
            }
            return verifiedToken;
        });
    }
}
exports.TokenService = TokenService;
