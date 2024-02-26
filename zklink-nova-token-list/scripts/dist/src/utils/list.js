"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortAlphabetically = exports.getBumpedVersions = void 0;
/**
 * Returns the token address from the mapping
 * @param versions
 * @returns
 */
const getBumpedVersions = (versions) => {
    const [currentVersion] = versions;
    return [
        Object.assign(Object.assign({}, currentVersion), { minor: currentVersion.minor + 1 }),
    ];
};
exports.getBumpedVersions = getBumpedVersions;
/**
 * Returns the token address from the mapping
 * @param tokenList
 * @returns
 */
const sortAlphabetically = (tokenList) => {
    return [...tokenList].sort((a, b) => a.name.localeCompare(b.name));
};
exports.sortAlphabetically = sortAlphabetically;
