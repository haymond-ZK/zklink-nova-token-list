"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.configSchema = joi_1.default.object({
    L1_PROVIDER_URL: joi_1.default.string().required().min(1).message('L1_PROVIDER_URL cannot be empty.'),
    L2_PROVIDER_URL: joi_1.default.string().required().min(1).message('L2_PROVIDER_URL cannot be empty.'),
    L1_TOKEN_BRIDGE_ADDRESS: joi_1.default.string().required().min(1).message('L1_TOKEN_BRIDGE_ADDRESS cannot be empty.'),
    L2_TOKEN_BRIDGE_ADDRESS: joi_1.default.string().required().min(1).message('L2_TOKEN_BRIDGE_ADDRESS cannot be empty.'),
    TOKEN_BRIDGE_ABI_PATH: joi_1.default.string().default('src/abis/token-bridge.abi.json'),
    ERC20_ABI_PATH: joi_1.default.string().default('src/abis/ERC20.abi.json'),
    ERC20_BYTE32_ABI_PATH: joi_1.default.string().default('src/abis/ERC20-byte32.abi.json'),
    TOKEN_FULL_LIST_PATH: joi_1.default.string().default('json/linea-mainnet-token-fulllist.json'),
    TOKEN_SHORT_LIST_PATH: joi_1.default.string().default('json/linea-mainnet-token-shortlist.json'),
    COINGECKO_URL: joi_1.default.string().default('https://api.coingecko.com/api/v3/coins/1/contract/'),
    COINMARKETCAP_URL: joi_1.default.string().default('https://pro-api.coinmarketcap.com'),
    COINMARKETCAP_API_KEY: joi_1.default.string().allow('').optional(),
    ETHEREUM_MAINNET_CHAIN_ID: joi_1.default.number().default(1),
    LINEA_MAINNET_CHAIN_ID: joi_1.default.number().default(59144),
});
