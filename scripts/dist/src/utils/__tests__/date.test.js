"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const date_1 = require("src/utils/date");
const date_fns_1 = require("date-fns");
describe('getCurrentDate', () => {
    it('should return the current date in yyyy-MM-dd format', () => {
        const actualDate = new Date();
        const expectedResult = (0, date_fns_1.format)(actualDate, 'yyyy-MM-dd');
        const result = (0, date_1.getCurrentDate)();
        expect(result).toEqual(expectedResult);
    });
});
