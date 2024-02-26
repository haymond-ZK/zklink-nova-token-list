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
const token_1 = require("src/models/token");
const ethers_1 = require("ethers");
const logger_1 = require("src/logger");
const date_1 = require("../date");
const token_2 = require("../token");
jest.mock('ethers');
jest.mock('src/config');
describe('Token Utility Functions', () => {
    describe('getEventTokenAddresses', () => {
        it('should return normalized token addresses from event', () => {
            const mockEvent = {
                args: {
                    token: '0x3155BA85D5F96b2d030a4966AF206230e46849cb',
                    bridgedToken: '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
                    nativeToken: '0xd38BB40815d2B0c2d2c866e0c72c5728ffC76dd9',
                },
                event: 'NewTokenDeployed',
            };
            const { tokenAddress, nativeTokenAddress } = (0, token_2.getEventTokenAddresses)(mockEvent);
            expect(tokenAddress).toBe(ethers_1.utils.getAddress(mockEvent.args.bridgedToken));
            expect(nativeTokenAddress).toBe(ethers_1.utils.getAddress(mockEvent.args.nativeToken));
        });
    });
    describe('fetchTokenInfo', () => {
        it('should fetch token info and return a Token object', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockContract = {
                name: jest.fn().mockResolvedValue('MockToken'),
                symbol: jest.fn().mockResolvedValue('MTK'),
                decimals: jest.fn().mockResolvedValue(18),
                address: '0xmockAddress...',
            };
            const result = yield (0, token_2.fetchTokenInfo)(mockContract, token_1.ABIType.STANDARD);
            const expectedToken = {
                chainId: 0,
                chainURI: '',
                tokenId: '',
                tokenType: [],
                address: '',
                name: 'MockToken',
                symbol: 'MTK',
                decimals: 18,
                createdAt: (0, date_1.getCurrentDate)(),
                updatedAt: (0, date_1.getCurrentDate)(),
                extension: {
                    rootChainId: 1,
                    rootChainURI: '',
                    rootAddress: ethers_1.utils.getAddress(mockContract.address),
                },
            };
            expect(result).toEqual(expectedToken);
        }));
    });
    describe('checkTokenExists', () => {
        it('should find and return the token if it exists in the token list by address', () => {
            const mockToken = {
                chainId: 1,
                chainURI: 'https://lineascan.build/block/0',
                tokenId: 'https://lineascan.build/address/',
                tokenType: ['canonical-bridge'],
                address: '0x3155BA85D5F96b2d030a4966AF206230e46849cb',
                name: 'MockToken',
                symbol: 'MTK',
                decimals: 18,
                createdAt: '2023-10-13T00:00:00Z',
                updatedAt: '2023-10-13T00:00:00Z',
                extension: {
                    rootChainId: 1,
                    rootChainURI: 'https://etherscan.io',
                    rootAddress: '0x8E870D67F660D95d5be530380D0eC0bd388289E1',
                },
            };
            const tokenList = [mockToken];
            const tokenAddress = '0x3155BA85D5F96b2d030a4966AF206230e46849cb';
            const result = (0, token_2.checkTokenExists)(tokenList, tokenAddress);
            expect(result).toEqual(mockToken);
        });
    });
    describe('checkTokenErrors', () => {
        it('should throw an error for mismatched token fields', () => {
            const token = {
                chainId: 1,
                chainURI: '',
                tokenId: '',
                tokenType: [],
                address: '0xTokenAddress1',
                name: 'TokenName1',
                symbol: 'SYMBOL1',
                decimals: 18,
                createdAt: '2023-10-13T00:00:00Z',
                updatedAt: '2023-10-13T00:00:00Z',
                extension: {
                    rootChainId: 1,
                    rootChainURI: '',
                    rootAddress: '0xRootAddress1',
                },
            };
            const verifiedToken = {
                chainId: 2, // Mismatched field
                chainURI: '',
                tokenId: '',
                tokenType: [],
                address: '0xTokenAddress1',
                name: 'TokenName1',
                symbol: 'SYMBOL1',
                decimals: 18,
                createdAt: '2023-10-13T00:00:00Z',
                updatedAt: '2023-10-13T00:00:00Z',
                extension: {
                    rootChainId: 1,
                    rootChainURI: '',
                    rootAddress: '0xRootAddress1',
                },
            };
            const mockLoggerError = jest.spyOn(logger_1.logger, 'error');
            expect(() => (0, token_2.checkTokenErrors)(token, verifiedToken)).toThrowError();
            expect(mockLoggerError).toHaveBeenCalledWith('chainId mismatch', expect.objectContaining({ currentChainId: 1, newChainId: 2 }));
        });
    });
});
