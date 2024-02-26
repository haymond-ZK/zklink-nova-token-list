"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("src/logger");
const abi_1 = require("src/utils/abi");
jest.mock('fs');
jest.mock('src/logger', () => ({
    logger: {
        error: jest.fn(),
    },
}));
describe('loadABI', () => {
    it('should load and parse ABI from file system', () => {
        const mockAbi = { some: 'abi' };
        const mockPath = './path/to/abi';
        fs_1.default.readFileSync.mockReturnValue(JSON.stringify(mockAbi));
        const result = (0, abi_1.loadABI)(mockPath);
        expect(result).toEqual(mockAbi);
        expect(fs_1.default.readFileSync).toHaveBeenCalledWith(mockPath);
        expect(logger_1.logger.error).not.toHaveBeenCalled();
    });
    it('should log an error and throw if ABI loading fails', () => {
        const mockPath = './path/to/abi';
        const mockError = new Error('File not found');
        fs_1.default.readFileSync.mockImplementation(() => {
            throw mockError;
        });
        expect(() => (0, abi_1.loadABI)(mockPath)).toThrowError(mockError);
        expect(logger_1.logger.error).toHaveBeenCalledWith('Error loading ABI', { from: mockPath }, { error: mockError });
    });
});
