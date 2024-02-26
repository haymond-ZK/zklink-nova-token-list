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
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const ethers_1 = require("ethers");
const config_1 = require("src/config");
const logger_1 = require("src/logger");
const file_1 = require("src/utils/file");
const token_service_1 = require("src/services/token.service");
const validation_1 = require("src/utils/validation");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            logger_1.logger.info('Starting check mainnet shortlist');
            (0, validation_1.validateConfig)(config_1.config);
            const l1Provider = new ethers_1.ethers.providers.JsonRpcProvider(config_1.config.L1_PROVIDER_URL);
            const l2Provider = new ethers_1.ethers.providers.JsonRpcProvider(config_1.config.L2_PROVIDER_URL);
            const existingTokenList = (0, file_1.readJsonFile)(config_1.config.TOKEN_FULL_LIST_PATH);
            const tokenService = new token_service_1.TokenService(l1Provider, l2Provider, existingTokenList);
            yield tokenService.verifyList(config_1.config.TOKEN_SHORT_LIST_PATH);
            logger_1.logger.info('Check mainnet shortlist succesfully executed');
        }
        catch (error) {
            logger_1.logger.error(`Error in main: ${error}`);
            throw error;
        }
    });
}
// Execute the script
main();
