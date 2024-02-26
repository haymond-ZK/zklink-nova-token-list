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
const ethers_1 = require("ethers");
const token_service_1 = require("../token.service");
const mockedData_1 = require("./mockedData");
describe('TokenService', () => {
    let tokenService;
    let l1Provider;
    let l2Provider;
    beforeEach(() => {
        l1Provider = new ethers_1.providers.JsonRpcProvider('l1-provider-url');
        l2Provider = new ethers_1.providers.JsonRpcProvider('l2-provider-url');
        tokenService = new token_service_1.TokenService(l1Provider, l2Provider, mockedData_1.mockTokenShortlist);
    });
    describe('fetchAndAssignTokenLogo', () => {
        it('should fetch and assign the token logo URI', () => __awaiter(void 0, void 0, void 0, function* () {
            const token = mockedData_1.mockExistingTokenList[0];
            const mockLogoURI = 'https://s2.coinmarketcap.com/static/img/coins/64x64/15024.png';
            const fetchLogoURIMock = jest.spyOn(tokenService, 'fetchAndAssignTokenLogo');
            fetchLogoURIMock.mockResolvedValue(mockedData_1.mockExistingTokenList[0]);
            const result = yield tokenService.fetchAndAssignTokenLogo(token);
            expect(result === null || result === void 0 ? void 0 : result.logoURI).toEqual(mockLogoURI);
        }));
    });
    describe('concatTokenShortList', () => {
        it('should add new tokens to the token list', () => {
            tokenService['tokenList'] = [...mockedData_1.mockExistingTokenList];
            tokenService.concatTokenShortList(mockedData_1.mockTokenShortlist);
            expect(tokenService['tokenList']).toHaveLength(3);
            expect(tokenService['tokenList']).toEqual(expect.arrayContaining([
                ...mockedData_1.mockExistingTokenList, // Existing token should still be in the list
                mockedData_1.mockTokenShortlist.tokens[0], // New token should be added to the list
            ]));
        });
        it('should replace existing tokens in the token list if they are different', () => {
            tokenService['tokenList'] = mockedData_1.mockExistingTokenList;
            tokenService.concatTokenShortList(mockedData_1.mockTokenShortlist);
            expect(tokenService['tokenList']).toHaveLength(3);
            expect(tokenService['tokenList']).toEqual(expect.arrayContaining([mockedData_1.mockTokenShortlist.tokens[0]]));
        });
        it('should not modify the token list if existing tokens are the same', () => {
            tokenService['tokenList'] = [...mockedData_1.mockExistingTokenList];
            tokenService.concatTokenShortList(mockedData_1.mockTokenShortlist);
            expect(tokenService['tokenList']).toHaveLength(3);
            expect(tokenService['tokenList']).toEqual(expect.arrayContaining([...mockedData_1.mockExistingTokenList]));
        });
    });
});
