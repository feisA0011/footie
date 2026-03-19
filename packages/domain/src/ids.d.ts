import type { CanonicalId } from './entities.js';
declare const PREFIXES: {
    readonly competition: "cmp";
    readonly season: "ssn";
    readonly team: "tem";
    readonly player: "ply";
    readonly match: "mtc";
};
export type CanonicalEntityType = keyof typeof PREFIXES;
export declare const createCanonicalId: (entityType: CanonicalEntityType, seed: string) => CanonicalId;
export {};
//# sourceMappingURL=ids.d.ts.map