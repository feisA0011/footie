import Fastify from 'fastify';
import cors from '@fastify/cors';
import { resolve } from 'node:path';
import { buildApiSnapshot, getHealthResponse } from './server.js';
import { getCapabilitiesResponse } from './routes/capabilities.js';
import {
  FixtureProviderAdapter,
  createBatch,
  normalizeFixtureBatch,
  publishValidatedBatch,
  validateNormalizedBatch
} from '@footie/data-ingestion';
import {
  getDb,
  matchRepo,
  teamRepo,
  competitionRepo,
  seasonRepo,
  playerRepo,
  searchRepo
} from '@footie/db';

// ─── DB setup ────────────────────────────────────────────────────────────────
process.env['FOOTIE_DB_PATH'] ??= resolve(process.cwd(), 'footie.db');
const db = getDb();
const matchR = matchRepo(db);
const teamR = teamRepo(db);
const compR = competitionRepo(db);
const seasonR = seasonRepo(db);
const playerR = playerRepo(db);
const search = searchRepo();

// ─── Server ───────────────────────────────────────────────────────────────────
const server = Fastify({ logger: { level: 'warn' } });
await server.register(cors, { origin: true });

// ─── Pipeline (kept for ingestion endpoint) ───────────────────────────────────
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

// ─── Routes ───────────────────────────────────────────────────────────────────

server.get('/health', async () => getHealthResponse());
server.get('/api/snapshot', async () => buildApiSnapshot());
server.get('/api/capabilities', async () => getCapabilitiesResponse());

// Matches — reads from DB
server.get('/api/matches', async (req) => {
  const { status, competition, limit } = req.query as Record<string, string>;
  const rows = matchR.findAll(Number(limit) || 50);

  const teams = teamR.findAll();
  const comps = compR.findAll();
  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));
  const compMap = Object.fromEntries(comps.map((c) => [c.id, c]));

  let enriched = rows.map((r) => ({
    id: r.match.id,
    kickoffAt: r.match.kickoffAt,
    status: r.match.status,
    homeScore: r.match.homeScore ?? null,
    awayScore: r.match.awayScore ?? null,
    minutePlayed: r.match.minutePlayed ?? null,
    homeTeam: teamMap[r.match.homeTeamId],
    awayTeam: teamMap[r.match.awayTeamId],
    competition: compMap[r.match.competitionId],
    season: r.season
  }));

  if (status) enriched = enriched.filter((m) => m.status === status);
  if (competition) enriched = enriched.filter((m) => m.competition?.slug === competition);

  return {
    matches: enriched,
    meta: {
      total: enriched.length,
      competitions: new Set(enriched.map((m) => m.competition?.id)).size,
      teams: new Set([...enriched.map((m) => m.homeTeam?.id), ...enriched.map((m) => m.awayTeam?.id)]).size
    }
  };
});

// Teams
server.get('/api/teams', async () => ({
  teams: teamR.findAll(),
  meta: { total: teamR.findAll().length }
}));

// Players
server.get('/api/players', async () => ({
  players: playerR.findAll(),
  meta: { total: playerR.findAll().length }
}));

// Competitions
server.get('/api/competitions', async () => ({
  competitions: compR.findAll(),
  meta: { total: compR.findAll().length }
}));

// Search (M4 — FTS5)
server.get('/api/search', async (req, reply) => {
  const { q, type } = req.query as Record<string, string>;
  if (!q || q.trim().length < 2) {
    return reply.status(400).send({ error: 'Query must be at least 2 characters' });
  }
  let results = search.search(q, 20);
  if (type) results = results.filter((r) => r.entityType === type);
  return { query: q, results, total: results.length };
});

// Partner API (M5) — versioned, with API key gate
server.addHook('preHandler', async (req, reply) => {
  if (!req.url.startsWith('/v1/')) return;
  const key = req.headers['x-api-key'];
  if (!key || key !== (process.env['FOOTIE_API_KEY'] ?? 'dev-key')) {
    return reply.status(401).send({ error: 'Invalid or missing API key. Pass X-Api-Key header.' });
  }
});

server.get('/v1/matches', async (req) => {
  const { competition, status, limit } = req.query as Record<string, string>;
  const rows = matchR.findAll(Number(limit) || 20);
  const teams = teamR.findAll();
  const comps = compR.findAll();
  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));
  const compMap = Object.fromEntries(comps.map((c) => [c.id, c]));

  let enriched = rows.map((r) => ({
    id: r.match.id,
    kickoffAt: r.match.kickoffAt,
    status: r.match.status,
    score: r.match.homeScore != null
      ? `${r.match.homeScore}–${r.match.awayScore}`
      : null,
    homeTeam: teamMap[r.match.homeTeamId]?.name,
    awayTeam: teamMap[r.match.awayTeamId]?.name,
    competition: compMap[r.match.competitionId]?.name,
    competitionSlug: compMap[r.match.competitionId]?.slug
  }));

  if (status) enriched = enriched.filter((m) => m.status === status);
  if (competition) enriched = enriched.filter((m) => m.competitionSlug === competition);

  return { version: 'v1', matches: enriched, total: enriched.length };
});

server.get('/v1/teams', async () => ({
  version: 'v1',
  teams: teamR.findAll().map((t) => ({ id: t.id, name: t.name, slug: t.slug, countryCode: t.countryCode }))
}));

server.get('/v1/players', async () => ({
  version: 'v1',
  players: playerR.findAll().map((p) => ({ id: p.id, displayName: p.displayName, primaryPosition: p.primaryPosition, nationality: p.nationality }))
}));

server.get('/v1/search', async (req, reply) => {
  const { q } = req.query as Record<string, string>;
  if (!q || q.trim().length < 2) {
    return reply.status(400).send({ error: 'Query too short' });
  }
  const results = search.search(q, 10);
  return { version: 'v1', query: q, results };
});

// Widget endpoint (M5) — lightweight embeddable
server.get('/widget/match/:id', async (req, reply) => {
  const { id } = req.params as { id: string };
  const match = matchR.findById(id);
  if (!match) return reply.status(404).send({ error: 'Match not found' });
  const home = teamR.findById(match.homeTeamId);
  const away = teamR.findById(match.awayTeamId);
  const comp = compR.findById(match.competitionId);
  return {
    widget: 'match-card',
    data: {
      id: match.id,
      home: home?.name ?? match.homeTeamId,
      away: away?.name ?? match.awayTeamId,
      score: match.homeScore != null ? `${match.homeScore}–${match.awayScore}` : null,
      status: match.status,
      kickoff: match.kickoffAt,
      competition: comp?.name ?? null
    },
    embed: `<div class="footie-widget" data-match="${id}" data-home="${home?.name}" data-away="${away?.name}" data-status="${match.status}"></div>`
  };
});

// Narrative (M5) — match preview/summary text generation
server.get('/api/narrative/:matchId', async (req, reply) => {
  const { matchId } = req.params as { matchId: string };
  const match = matchR.findById(matchId);
  if (!match) return reply.status(404).send({ error: 'Match not found' });
  const home = teamR.findById(match.homeTeamId);
  const away = teamR.findById(match.awayTeamId);
  const comp = compR.findById(match.competitionId);

  const narrative = generateNarrative(match, home?.name, away?.name, comp?.name);
  return { matchId, narrative };
});

// Pipeline run endpoint (for admin/debug)
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

// ─── Narrative generator (M5 worker) ─────────────────────────────────────────

function generateNarrative(
  match: { status: string; kickoffAt: string; homeScore: number | null; awayScore: number | null },
  home = 'Home',
  away = 'Away',
  competition = 'the league'
) {
  const kickoff = new Date(match.kickoffAt);
  const dateStr = kickoff.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const timeStr = kickoff.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

  if (match.status === 'scheduled') {
    return {
      type: 'preview',
      headline: `${home} host ${away} in ${competition} clash`,
      body: `${home} welcome ${away} to their home ground on ${dateStr} (${timeStr} UTC) in what promises to be a pivotal ${competition} encounter. Both sides will be looking to secure crucial points in the standings.`,
      tags: [home, away, competition, 'preview']
    };
  }

  if (match.status === 'finished' && match.homeScore != null) {
    const winner = match.homeScore > match.awayScore! ? home : match.homeScore < match.awayScore! ? away : null;
    const scoreStr = `${match.homeScore}–${match.awayScore}`;
    return {
      type: 'report',
      headline: winner
        ? `${winner} secure victory with ${scoreStr} win in ${competition}`
        : `${home} and ${away} share spoils in ${scoreStr} draw`,
      body: winner
        ? `${winner} claimed three points with a ${scoreStr} ${competition} victory on ${dateStr}, moving up the table with an impressive performance.`
        : `${home} and ${away} played out a ${scoreStr} draw in ${competition} on ${dateStr}, with both sides earning a point from the encounter.`,
      tags: [home, away, competition, 'match-report', match.status]
    };
  }

  return {
    type: 'update',
    headline: `${home} vs ${away} — ${match.status}`,
    body: `${home} take on ${away} in ${competition}. Current status: ${match.status}.`,
    tags: [home, away, competition]
  };
}

// ─── Start ────────────────────────────────────────────────────────────────────
const port = Number(process.env['PORT'] ?? 3001);
await server.listen({ port, host: '0.0.0.0' });
console.log(`\n  Footie API  →  http://localhost:${port}`);
console.log(`  DB          →  ${process.env['FOOTIE_DB_PATH']}\n`);
