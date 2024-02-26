"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_schema_1 = require("src/config/config.schema");
const logger_1 = require("src/logger");
const validation_1 = require("../validation");
jest.mock('src/config/config.schema');
jest.mock('src/logger');
describe('validateConfig', () => {
    const mockConfig = {
        L1_PROVIDER_URL: 'http://localhost:8545',
        L2_PROVIDER_URL: 'http://localhost:8546',
        L1_TOKEN_BRIDGE_ADDRESS: '0x123',
        L2_TOKEN_BRIDGE_ADDRESS: '0x456',
        TOKEN_BRIDGE_ABI_PATH: 'path1',
        ERC20_ABI_PATH: 'path2',
        ERC20_BYTE32_ABI_PATH: 'path3',
        TOKEN_FULL_LIST_PATH: 'path4',
        TOKEN_SHORT_LIST_PATH: 'path5',
        COINGECKO_URL: 'http://coingecko.com',
        COINMARKETCAP_URL: 'http://coinmarketcap.com',
        COINMARKETCAP_API_KEY: 'key',
        ETHEREUM_MAINNET_CHAIN_ID: 1,
        LINEA_MAINNET_CHAIN_ID: 59144,
    };
    beforeEach(() => {
        jest.resetAllMocks();
    });
    it('should validate config successfully', () => {
        config_schema_1.configSchema.validate.mockReturnValue({ error: null });
        const infoSpy = jest.spyOn(logger_1.logger, 'info');
        (0, validation_1.validateConfig)(mockConfig);
        expect(infoSpy).toHaveBeenCalledWith('Config validation success');
    });
    it('should throw error if config validation fails', () => {
        const errorMsg = 'Invalid L1_PROVIDER_URL';
        config_schema_1.configSchema.validate.mockReturnValue({
            error: { message: errorMsg },
        });
        expect(() => (0, validation_1.validateConfig)(mockConfig)).toThrow(`Config validation error: ${errorMsg}`);
    });
});
