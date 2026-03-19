import { describe, expect, it } from 'vitest';

import { createBatch } from '../adapters/provider-adapter.js';
import { FixtureProviderAdapter } from '../fixtures/fixture-provider.js';
import { normalizeFixtureBatch } from './normalize.js';
import { validateNormalizedBatch } from './validate.js';

describe('fixture normalization pipeline', () => {
  it('normalizes fixture envelopes into canonical data and validates cleanly', async () => {
    const adapter = new FixtureProviderAdapter();
    const envelopes = await adapter.fetchMatches({
      startsAt: '2026-03-19T00:00:00Z',
      endsAt: '2026-03-20T00:00:00Z',
      mode: 'incremental'
    });

    const batch = createBatch('batch_fixture_001', {
      startsAt: '2026-03-19T00:00:00Z',
      endsAt: '2026-03-20T00:00:00Z',
      mode: 'incremental'
    }, envelopes);
    const normalized = normalizeFixtureBatch(batch);
    const validation = validateNormalizedBatch(normalized);

    expect(normalized.dataset.matches).toHaveLength(1);
    expect(normalized.dataset.teams).toHaveLength(2);
    expect(validation.valid).toBe(true);
  });
});
