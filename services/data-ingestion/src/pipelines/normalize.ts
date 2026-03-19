import {
  createCanonicalId,
  type CanonicalDataset,
  type Competition,
  type Match,
  type ProviderMapping,
  type Season,
  type Team
} from '@footie/domain';

import type { IngestionBatch, NormalizationResult } from '../core/types.js';

interface FixtureMatchPayload {
  readonly competitionSlug: string;
  readonly seasonLabel: string;
  readonly homeTeam: string;
  readonly awayTeam: string;
  readonly kickoffAt: string;
  readonly status: Match['status'];
}

export const normalizeFixtureBatch = (
  batch: IngestionBatch<FixtureMatchPayload>
): NormalizationResult => {
  const competitions = new Map<string, Competition>();
  const seasons = new Map<string, Season>();
  const teams = new Map<string, Team>();
  const matches: Match[] = [];
  const providerMappings: ProviderMapping[] = [];

  for (const envelope of batch.envelopes) {
    const competitionId = createCanonicalId('competition', envelope.payload.competitionSlug) as Competition['id'];
    const seasonId = createCanonicalId(
      'season',
      `${envelope.payload.competitionSlug}-${envelope.payload.seasonLabel}`
    ) as Season['id'];
    const homeTeamId = createCanonicalId('team', envelope.payload.homeTeam) as Team['id'];
    const awayTeamId = createCanonicalId('team', envelope.payload.awayTeam) as Team['id'];
    const matchId = createCanonicalId(
      'match',
      `${envelope.payload.kickoffAt}-${envelope.payload.homeTeam}-${envelope.payload.awayTeam}`
    ) as Match['id'];

    competitions.set(competitionId, {
      id: competitionId,
      slug: envelope.payload.competitionSlug,
      name: envelope.payload.competitionSlug
        .split('-')
        .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
        .join(' ')
    });

    seasons.set(seasonId, {
      id: seasonId,
      competitionId,
      label: envelope.payload.seasonLabel,
      startDate: `${envelope.payload.seasonLabel.slice(0, 4)}-08-01`,
      endDate: `20${envelope.payload.seasonLabel.slice(-2)}-05-31`,
      isCurrent: true
    });

    teams.set(homeTeamId, {
      id: homeTeamId,
      slug: envelope.payload.homeTeam.toLowerCase().replaceAll(' ', '-'),
      name: envelope.payload.homeTeam
    });

    teams.set(awayTeamId, {
      id: awayTeamId,
      slug: envelope.payload.awayTeam.toLowerCase().replaceAll(' ', '-'),
      name: envelope.payload.awayTeam
    });

    matches.push({
      id: matchId,
      seasonId,
      competitionId,
      kickoffAt: envelope.payload.kickoffAt,
      homeTeamId,
      awayTeamId,
      status: envelope.payload.status,
      sources: [
        {
          provider: 'fixture',
          providerEntityId: envelope.providerEntityId,
          fetchedAt: envelope.fetchedAt,
          confidence: 0.4
        }
      ]
    });

    providerMappings.push({
      canonicalId: matchId,
      entityType: 'match',
      provider: 'fixture',
      providerEntityId: envelope.providerEntityId
    });
  }

  const dataset: CanonicalDataset = {
    competitions: [...competitions.values()],
    seasons: [...seasons.values()],
    teams: [...teams.values()],
    players: [],
    matches,
    providerMappings
  };

  return {
    batchId: batch.batchId,
    dataset
  };
};
