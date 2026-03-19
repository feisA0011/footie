import type { ProviderEnvelope } from '../core/types.js';
import type { ProviderAdapter } from '../adapters/provider-adapter.js';

const FIXTURE_MATCH = {
  competitionSlug: 'premier-league',
  seasonLabel: '2025-26',
  homeTeam: 'Arsenal',
  awayTeam: 'Chelsea',
  kickoffAt: '2026-03-19T19:45:00Z',
  status: 'scheduled'
} as const;

export class FixtureProviderAdapter implements ProviderAdapter<typeof FIXTURE_MATCH> {
  readonly provider = 'fixture';

  async fetchMatches(): Promise<readonly ProviderEnvelope<typeof FIXTURE_MATCH>[]> {
    return [
      {
        provider: this.provider,
        entity: 'match',
        providerEntityId: 'fixture-match-1',
        fetchedAt: new Date('2026-03-19T00:00:00Z').toISOString(),
        payload: FIXTURE_MATCH
      }
    ];
  }
}
