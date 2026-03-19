import { describe, expect, it } from 'vitest';

import { createCanonicalId } from './ids.js';

describe('createCanonicalId', () => {
  it('creates stable prefixed IDs', () => {
    expect(createCanonicalId('team', 'Arsenal FC')).toBe(createCanonicalId('team', ' arsenal fc '));
    expect(createCanonicalId('match', '2026-03-19 arsenal-chelsea')).toMatch(/^mtc_/);
  });
});
