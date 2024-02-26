"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethereum_1 = require("../ethereum");
describe('normalizeAddress', () => {
    it('should return the normalized address', () => {
        const addr = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
        const result = (0, ethereum_1.normalizeAddress)(addr);
        expect(result).toEqual('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
    });
    it('should throw error for invalid address', () => {
        const invalidAddr = 'invalid';
        expect(() => (0, ethereum_1.normalizeAddress)(invalidAddr)).toThrow();
    });
});
