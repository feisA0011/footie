import Fastify from 'fastify';
import cors from '@fastify/cors';
import { buildApiSnapshot, getHealthResponse } from './server.js';
import { getCapabilitiesResponse } from './routes/capabilities.js';
import {
  FixtureProviderAdapter,
  createBatch,
  normalizeFixtureBatch,
  publishValidatedBatch,
  validateNormalizedBatch
} from '@footie/data-ingestion';

const server = Fastify({ logger: { level: 'warn' } });
await server.register(cors, { origin: true });

const WINDOW = {
  startsAt: '2026-03-19T00:00:00Z',
  endsAt: '2026-03-20T00:00:00Z',
  mode: 'incremental' as const
};

const runPipeline = async () => {
  const adapter = new FixtureProviderAdapter();
  const envelopes = await adapter.fetchMatches(WINDOW);
  const batch = createBatch('batch_fixture_001', WINDOW, [...envelopes]);
  const normalized = normalizeFixtureBatch(batch);
  const validation = validateNormalizedBatch(normalized);
  const published = publishValidatedBatch(normalized, validation);
  return { normalized, validation, published };
};

server.get('/health', async () => getHealthResponse());
server.get('/api/snapshot', async () => buildApiSnapshot());
server.get('/api/capabilities', async () => getCapabilitiesResponse());

server.get('/api/pipeline/run', async () => {
  const result = await runPipeline();
  return {
    batchId: result.normalized.batchId,
    matchCount: result.validation.matchCount,
    valid: result.validation.valid,
    issueCount: result.validation.issues.length,
    publishRecord: result.published.publishRecord,
    dataset: result.normalized.dataset
  };
});

server.get('/api/matches', async () => {
  const { normalized } = await runPipeline();
  const { matches, teams, competitions, seasons } = normalized.dataset;

  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));
  const competitionMap = Object.fromEntries(competitions.map((c) => [c.id, c]));
  const seasonMap = Object.fromEntries(seasons.map((s) => [s.id, s]));

  return {
    matches: matches.map((m) => ({
      ...m,
      homeTeam: teamMap[m.homeTeamId],
      awayTeam: teamMap[m.awayTeamId],
      competition: competitionMap[m.competitionId],
      season: seasonMap[m.seasonId]
    })),
    meta: {
      total: matches.length,
      competitions: competitions.length,
      teams: teams.length
    }
  };
});

const port = Number(process.env['PORT'] ?? 3001);
await server.listen({ port, host: '0.0.0.0' });
console.log(`\n  Footie API  →  http://localhost:${port}\n`);
