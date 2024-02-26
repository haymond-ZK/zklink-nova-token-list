"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateConfig = void 0;
const config_schema_1 = require("src/config/config.schema");
const logger_1 = require("src/logger");
/**
 * Validate the config object
 * @param config
 */
const validateConfig = (config) => {
    const { error } = config_schema_1.configSchema.validate(config);
    if (error) {
        throw new Error(`Config validation error: ${error.message}`);
    }
    else {
        logger_1.logger.info('Config validation success');
    }
};
exports.validateConfig = validateConfig;
