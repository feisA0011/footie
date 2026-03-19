import type { CanonicalId } from './entities.js';

const PREFIXES = {
  competition: 'cmp',
  season: 'ssn',
  team: 'tem',
  player: 'ply',
  match: 'mtc'
} as const;

export type CanonicalEntityType = keyof typeof PREFIXES;

const simpleHash = (value: string): string => {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
};

export const createCanonicalId = (
  entityType: CanonicalEntityType,
  seed: string
): CanonicalId => {
  const prefix = PREFIXES[entityType];
  const normalizedSeed = seed.trim().toLowerCase();
  const digest = simpleHash(normalizedSeed);
  return `${prefix}_${digest}`;
};
