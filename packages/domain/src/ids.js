const PREFIXES = {
    competition: 'cmp',
    season: 'ssn',
    team: 'tem',
    player: 'ply',
    match: 'mtc'
};
const simpleHash = (value) => {
    let hash = 0;
    for (const char of value) {
        hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }
    return hash.toString(16).padStart(8, '0');
};
export const createCanonicalId = (entityType, seed) => {
    const prefix = PREFIXES[entityType];
    const normalizedSeed = seed.trim().toLowerCase();
    const digest = simpleHash(normalizedSeed);
    return `${prefix}_${digest}`;
};
//# sourceMappingURL=ids.js.map