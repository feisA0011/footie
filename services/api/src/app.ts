import Fastify from 'fastify';
import cors from '@fastify/cors';
import { buildApiSnapshot, getHealthResponse } from './server.js';
import { getCapabilitiesResponse } from './routes/capabilities.js';
import {
  FixtureProviderAdapter, createBatch, normalizeFixtureBatch,
  publishValidatedBatch, validateNormalizedBatch
} from '@footie/data-ingestion';
import {
  bootstrapDevDatabase, getDb, matchRepo, teamRepo, competitionRepo, seasonRepo, playerRepo, searchRepo,
  teamDetailRepo, playerDetailRepo, managerRepo, resolveDbPath
} from '@footie/db';
import {
  startLiveMatch, getLiveMatch, getAllLiveMatches, type MatchEvent
} from './simulation/live-engine.js';

// ─── DB ───────────────────────────────────────────────────────────────────────
process.env['FOOTIE_DB_PATH'] ??= resolveDbPath();

if (process.env['NODE_ENV'] !== 'production') {
  bootstrapDevDatabase();
}

const db = getDb();
const matchR = matchRepo(db);
const teamR = teamRepo(db);
const compR = competitionRepo(db);
const seasonR = seasonRepo(db);
const playerR = playerRepo(db);
const search = searchRepo();
const teamDetailR = teamDetailRepo(db);
const playerDetailR = playerDetailRepo(db);
const managerR = managerRepo(db);

// ─── Fastify ──────────────────────────────────────────────────────────────────
const server = Fastify({ logger: { level: 'warn' } });
await server.register(cors, { origin: true });

// ─── Helpers ──────────────────────────────────────────────────────────────────
const WINDOW = { startsAt: '2026-03-19T00:00:00Z', endsAt: '2026-03-20T00:00:00Z', mode: 'incremental' as const };
const runPipeline = async () => {
  const adapter = new FixtureProviderAdapter();
  const envelopes = await adapter.fetchMatches();
  const batch = createBatch('batch_fixture_001', WINDOW, [...envelopes]);
  const normalized = normalizeFixtureBatch(batch);
  const validation = validateNormalizedBatch(normalized);
  return { normalized, validation, published: publishValidatedBatch(normalized, validation) };
};

const enrichMatches = (rows: ReturnType<typeof matchR.findAll>) => {
  const teams = teamR.findAll();
  const comps = compR.findAll();
  const teamMap = Object.fromEntries(teams.map((t) => [t.id, t]));
  const compMap = Object.fromEntries(comps.map((c) => [c.id, c]));
  return rows.map((r) => ({
    id: r.match.id, kickoffAt: r.match.kickoffAt, status: r.match.status,
    homeScore: r.match.homeScore ?? null, awayScore: r.match.awayScore ?? null,
    minutePlayed: r.match.minutePlayed ?? null,
    homeTeam: teamMap[r.match.homeTeamId],
    awayTeam: teamMap[r.match.awayTeamId],
    competition: compMap[r.match.competitionId],
    season: r.season
  }));
};

// ─── Standing calculator ──────────────────────────────────────────────────────
const calcStandings = (competitionSlug: string) => {
  const comp = compR.findAll().find((c) => c.slug === competitionSlug);
  if (!comp) return null;
  const rows = matchR.findAll(500);
  const finished = rows.filter((r) => r.match.status === 'finished' && r.match.competitionId === comp.id);

  const table: Record<string, { id: string; name: string; slug: string; played: number; won: number; drawn: number; lost: number; gf: number; ga: number; form: string[] }> = {};

  const ensure = (teamId: string) => {
    if (!table[teamId]) {
      const t = teamR.findById(teamId);
      table[teamId] = { id: teamId, name: t?.name ?? teamId, slug: t?.slug ?? teamId, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, form: [] };
    }
    return table[teamId]!;
  };

  // Sort by date for form calculation
  const sorted = [...finished].sort((a, b) => a.match.kickoffAt.localeCompare(b.match.kickoffAt));

  for (const r of sorted) {
    const hs = r.match.homeScore ?? 0;
    const as_ = r.match.awayScore ?? 0;
    const home = ensure(r.match.homeTeamId);
    const away = ensure(r.match.awayTeamId);
    home.played++; away.played++;
    home.gf += hs; home.ga += as_;
    away.gf += as_; away.ga += hs;
    if (hs > as_) { home.won++; home.form.push('W'); away.lost++; away.form.push('L'); }
    else if (hs < as_) { away.won++; away.form.push('W'); home.lost++; home.form.push('L'); }
    else { home.drawn++; home.form.push('D'); away.drawn++; away.form.push('D'); }
  }

  return Object.values(table)
    .map((t) => ({ ...t, gd: t.gf - t.ga, points: t.won * 3 + t.drawn, form: t.form.slice(-5) }))
    .sort((a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf || a.name.localeCompare(b.name))
    .map((t, i) => ({ position: i + 1, ...t }));
};

// ─── Stats calculator ─────────────────────────────────────────────────────────
const calcTeamStats = (teamSlug: string) => {
  const team = teamR.findAll().find((t) => t.slug === teamSlug);
  if (!team) return null;
  const rows = matchR.findAll(500);
  const teamMatches = rows.filter((r) => r.match.homeTeamId === team.id || r.match.awayTeamId === team.id);
  const finished = teamMatches.filter((r) => r.match.status === 'finished');

  let home = { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 };
  let away = { ...home };

  for (const r of finished) {
    const isHome = r.match.homeTeamId === team.id;
    const hs = r.match.homeScore ?? 0, as_ = r.match.awayScore ?? 0;
    const gf = isHome ? hs : as_, ga = isHome ? as_ : hs;
    const bucket = isHome ? home : away;
    bucket.played++; bucket.gf += gf; bucket.ga += ga;
    if (gf > ga) bucket.won++;
    else if (gf === ga) bucket.drawn++;
    else bucket.lost++;
  }

  const all = { played: home.played + away.played, won: home.won + away.won, drawn: home.drawn + away.drawn, lost: home.lost + away.lost, gf: home.gf + away.gf, ga: home.ga + away.ga };

  return {
    team,
    overall: { ...all, gd: all.gf - all.ga, points: all.won * 3 + all.drawn, cleanSheets: finished.filter((r) => { const isHome = r.match.homeTeamId === team.id; return isHome ? r.match.awayScore === 0 : r.match.homeScore === 0; }).length },
    home, away,
    form: finished.sort((a, b) => b.match.kickoffAt.localeCompare(a.match.kickoffAt)).slice(0, 5).map((r) => {
      const isHome = r.match.homeTeamId === team.id;
      const gf = isHome ? (r.match.homeScore ?? 0) : (r.match.awayScore ?? 0);
      const ga = isHome ? (r.match.awayScore ?? 0) : (r.match.homeScore ?? 0);
      return { matchId: r.match.id, opponent: teamR.findById(isHome ? r.match.awayTeamId : r.match.homeTeamId)?.name ?? '?', score: `${gf}–${ga}`, result: gf > ga ? 'W' : gf === ga ? 'D' : 'L', kickoffAt: r.match.kickoffAt };
    })
  };
};

// ─── Auth hook for partner API ────────────────────────────────────────────────
server.addHook('preHandler', async (req, reply) => {
  if (!req.url.startsWith('/v1/')) return;
  const key = req.headers['x-api-key'];
  if (!key || key !== (process.env['FOOTIE_API_KEY'] ?? 'dev-key')) {
    return reply.status(401).send({ error: 'Invalid or missing X-Api-Key header' });
  }
});

// ─── Core routes ──────────────────────────────────────────────────────────────
server.get('/health', async () => getHealthResponse());
server.get('/api/snapshot', async () => buildApiSnapshot());
server.get('/api/capabilities', async () => getCapabilitiesResponse());

server.get('/api/matches', async (req) => {
  const { status, competition, limit } = req.query as Record<string, string>;
  let enriched = enrichMatches(matchR.findAll(Number(limit) || 200));
  if (status) enriched = enriched.filter((m) => m.status === status);
  if (competition) enriched = enriched.filter((m) => m.competition?.slug === competition);
  return { matches: enriched, meta: { total: enriched.length, competitions: new Set(enriched.map((m) => m.competition?.id)).size, teams: new Set([...enriched.map((m) => m.homeTeam?.id), ...enriched.map((m) => m.awayTeam?.id)]).size } };
});

server.get('/api/teams', async () => {
  const rows = teamDetailR.findAll();
  const teams = rows.map((r) => ({ ...r.team, manager: r.manager }));
  return { teams, meta: { total: teams.length } };
});

server.get('/api/teams/:slug', async (req, reply) => {
  const { slug } = req.params as { slug: string };
  const row = teamDetailR.findBySlug(slug);
  if (!row) return reply.status(404).send({ error: `Team '${slug}' not found` });
  const squad = teamDetailR.getSquadWithStats(row.team.id, '2025-26');
  const stats = calcTeamStats(slug);
  const rows = matchR.findAll(500);
  const recentMatches = rows
    .filter((r) => r.match.homeTeamId === row.team.id || r.match.awayTeamId === row.team.id)
    .filter((r) => r.match.status === 'finished')
    .sort((a, b) => b.match.kickoffAt.localeCompare(a.match.kickoffAt))
    .slice(0, 10)
    .map((r) => ({
      matchId: r.match.id, kickoffAt: r.match.kickoffAt,
      homeTeam: teamR.findById(r.match.homeTeamId)?.name,
      awayTeam: teamR.findById(r.match.awayTeamId)?.name,
      homeScore: r.match.homeScore, awayScore: r.match.awayScore,
      competition: compR.findById(r.match.competitionId)?.name
    }));
  return {
    team: { ...row.team, manager: row.manager },
    stats,
    squad: squad.map((s) => ({ ...s.player, stats: s.stats })),
    recentMatches
  };
});

server.get('/api/players', async () => {
  const rows = playerDetailR.findAll();
  const players = rows.map((r) => ({ ...r.player, team: r.team }));
  return { players, meta: { total: players.length } };
});

server.get('/api/players/:slug', async (req, reply) => {
  const { slug } = req.params as { slug: string };
  const row = playerDetailR.findBySlug(slug);
  if (!row) return reply.status(404).send({ error: `Player '${slug}' not found` });
  const stats = playerDetailR.getStats(row.player.id);
  const career = playerDetailR.getCareer(row.player.id);
  return {
    player: { ...row.player, team: row.team },
    stats,
    career: career.map((c) => ({ ...c.stint, team: c.team }))
  };
});

server.get('/api/managers', async () => {
  const rows = managerR.findAll();
  const managers = rows.map((r) => ({ ...r.manager, currentTeam: r.team }));
  return { managers, meta: { total: managers.length } };
});

server.get('/api/managers/:slug', async (req, reply) => {
  const { slug } = req.params as { slug: string };
  const row = managerR.findBySlug(slug);
  if (!row) return reply.status(404).send({ error: `Manager '${slug}' not found` });
  const stints = managerR.getStints(row.manager.id);
  return {
    manager: { ...row.manager, currentTeam: row.team },
    stints: stints.map((s) => ({ ...s.stint, team: s.team }))
  };
});

server.get('/api/competitions', async () => ({ competitions: compR.findAll(), meta: { total: compR.findAll().length } }));

// ─── Standings ────────────────────────────────────────────────────────────────
server.get('/api/standings/:competition', async (req, reply) => {
  const { competition } = req.params as { competition: string };
  const table = calcStandings(competition);
  if (!table) return reply.status(404).send({ error: `Competition '${competition}' not found` });
  const comp = compR.findAll().find((c) => c.slug === competition);
  return { competition: comp, table, updatedAt: new Date().toISOString() };
});

// ─── Team stats ───────────────────────────────────────────────────────────────
server.get('/api/teams/:slug/stats', async (req, reply) => {
  const { slug } = req.params as { slug: string };
  const stats = calcTeamStats(slug);
  if (!stats) return reply.status(404).send({ error: `Team '${slug}' not found` });
  return stats;
});

// ─── Head-to-head ─────────────────────────────────────────────────────────────
server.get('/api/head-to-head', async (req, reply) => {
  const { home, away } = req.query as Record<string, string>;
  if (!home || !away) return reply.status(400).send({ error: 'Provide ?home=slug&away=slug' });
  const homeTeam = teamR.findAll().find((t) => t.slug === home);
  const awayTeam = teamR.findAll().find((t) => t.slug === away);
  if (!homeTeam || !awayTeam) return reply.status(404).send({ error: 'Team not found' });

  const rows = matchR.findAll(500);
  const meetings = rows.filter((r) =>
    (r.match.homeTeamId === homeTeam.id && r.match.awayTeamId === awayTeam.id) ||
    (r.match.homeTeamId === awayTeam.id && r.match.awayTeamId === homeTeam.id)
  );
  const finished = meetings.filter((r) => r.match.status === 'finished');

  let hw = 0, aw = 0, d = 0;
  for (const r of finished) {
    const hs = r.match.homeScore ?? 0, as_ = r.match.awayScore ?? 0;
    const homeIsRef = r.match.homeTeamId === homeTeam.id;
    const gf = homeIsRef ? hs : as_, ga = homeIsRef ? as_ : hs;
    if (gf > ga) hw++;
    else if (gf < ga) aw++;
    else d++;
  }

  return {
    home: homeTeam, away: awayTeam,
    summary: { played: finished.length, homeWins: hw, awayWins: aw, draws: d },
    meetings: finished.slice(0, 10).map((r) => ({
      matchId: r.match.id, kickoffAt: r.match.kickoffAt,
      score: `${r.match.homeScore ?? 0}–${r.match.awayScore ?? 0}`,
      homeTeam: teamR.findById(r.match.homeTeamId)?.name, awayTeam: teamR.findById(r.match.awayTeamId)?.name
    }))
  };
});

// ─── Search ───────────────────────────────────────────────────────────────────
server.get('/api/search', async (req, reply) => {
  const { q, type } = req.query as Record<string, string>;
  if (!q || q.trim().length < 2) return reply.status(400).send({ error: 'Query must be at least 2 characters' });
  let results = search.search(q, 20);
  if (type) results = results.filter((r) => r.entityType === type);
  return { query: q, results, total: results.length };
});

// ─── Live SSE ─────────────────────────────────────────────────────────────────
server.get('/api/live', async (_req, reply) => {
  return { live: getAllLiveMatches(), count: getAllLiveMatches().length };
});

server.get('/api/live/start/:matchId', async (req, reply) => {
  const { matchId } = req.params as { matchId: string };
  const match = matchR.findById(matchId);
  if (!match) return reply.status(404).send({ error: 'Match not found' });
  const homeTeam = teamR.findById(match.homeTeamId);
  const awayTeam = teamR.findById(match.awayTeamId);
  const comp = compR.findById(match.competitionId);
  const state = startLiveMatch(matchId, homeTeam?.name ?? 'Home', awayTeam?.name ?? 'Away', comp?.name ?? 'Unknown');
  return { started: true, matchId, status: state.status, homeTeam: state.homeTeam, awayTeam: state.awayTeam };
});

// SSE stream for live match
server.get('/api/live/stream/:matchId', async (req, reply) => {
  const { matchId } = req.params as { matchId: string };

  reply.raw.setHeader('Content-Type', 'text/event-stream');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');
  reply.raw.setHeader('X-Accel-Buffering', 'no');
  reply.raw.flushHeaders();

  const send = (event: string, data: unknown) => {
    reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Send current state immediately
  const existing = getLiveMatch(matchId);
  if (existing) {
    send('state', { matchId: existing.matchId, homeTeam: existing.homeTeam, awayTeam: existing.awayTeam, homeScore: existing.homeScore, awayScore: existing.awayScore, minute: existing.minute, status: existing.status, events: existing.events.slice(-10) });
  } else {
    // Auto-start the match
    const match = matchR.findById(matchId);
    if (match) {
      const ht = teamR.findById(match.homeTeamId);
      const at = teamR.findById(match.awayTeamId);
      const comp = compR.findById(match.competitionId);
      startLiveMatch(matchId, ht?.name ?? 'Home', at?.name ?? 'Away', comp?.name ?? 'League');
    }
    send('connecting', { matchId, message: 'Match simulation starting...' });
  }

  const state = getLiveMatch(matchId);
  if (!state) { reply.raw.end(); return reply; }

  const onEvent = (event: MatchEvent) => {
    try { send('event', event); } catch { /* client disconnected */ }
  };

  state.subscribers.add(onEvent);

  // Keepalive ping every 15s
  const ping = setInterval(() => {
    try { reply.raw.write(`: keepalive\n\n`); } catch { clearInterval(ping); }
  }, 15000);

  req.raw.on('close', () => {
    clearInterval(ping);
    state.subscribers.delete(onEvent);
    reply.raw.end();
  });

  return reply;
});

// ─── Narrative ────────────────────────────────────────────────────────────────
server.get('/api/narrative/:matchId', async (req, reply) => {
  const { matchId } = req.params as { matchId: string };
  const match = matchR.findById(matchId);
  if (!match) return reply.status(404).send({ error: 'Match not found' });
  const home = teamR.findById(match.homeTeamId);
  const away = teamR.findById(match.awayTeamId);
  const comp = compR.findById(match.competitionId);
  return { matchId, narrative: generateNarrative(match, home?.name, away?.name, comp?.name) };
});

// ─── Widget ───────────────────────────────────────────────────────────────────
server.get('/widget/match/:id', async (req, reply) => {
  const { id } = req.params as { id: string };
  const match = matchR.findById(id);
  if (!match) return reply.status(404).send({ error: 'Match not found' });
  const home = teamR.findById(match.homeTeamId);
  const away = teamR.findById(match.awayTeamId);
  const comp = compR.findById(match.competitionId);
  return {
    widget: 'match-card', version: '1',
    data: { id: match.id, home: home?.name, away: away?.name, score: match.homeScore != null ? `${match.homeScore}–${match.awayScore}` : null, status: match.status, kickoff: match.kickoffAt, competition: comp?.name },
    embed: `<div class="footie-widget" data-match="${id}" data-home="${home?.name}" data-away="${away?.name}" data-status="${match.status}"></div>`
  };
});

// ─── Pipeline ────────────────────────────────────────────────────────────────
server.get('/api/pipeline/run', async () => {
  const result = await runPipeline();
  return { batchId: result.normalized.batchId, matchCount: result.validation.matchCount, valid: result.validation.valid, issueCount: result.validation.issues.length, publishRecord: result.published.publishRecord, dataset: result.normalized.dataset };
});

// ─── Partner API v1 ───────────────────────────────────────────────────────────
server.get('/v1/matches', async (req) => {
  const { competition, status, limit } = req.query as Record<string, string>;
  let enriched = enrichMatches(matchR.findAll(Number(limit) || 20));
  if (status) enriched = enriched.filter((m) => m.status === status);
  if (competition) enriched = enriched.filter((m) => m.competition?.slug === competition);
  return { version: 'v1', matches: enriched.map((m) => ({ id: m.id, kickoffAt: m.kickoffAt, status: m.status, score: m.homeScore != null ? `${m.homeScore}–${m.awayScore}` : null, homeTeam: m.homeTeam?.name, awayTeam: m.awayTeam?.name, competition: m.competition?.name, competitionSlug: m.competition?.slug })), total: enriched.length };
});
server.get('/v1/standings/:competition', async (req, reply) => {
  const { competition } = req.params as { competition: string };
  const table = calcStandings(competition);
  if (!table) return reply.status(404).send({ error: 'Not found' });
  return { version: 'v1', competition, table };
});
server.get('/v1/teams', async () => ({ version: 'v1', teams: teamR.findAll().map((t) => ({ id: t.id, name: t.name, slug: t.slug, countryCode: t.countryCode })) }));
server.get('/v1/players', async () => ({ version: 'v1', players: playerR.findAll().map((p) => ({ id: p.id, displayName: p.displayName, primaryPosition: p.primaryPosition, nationality: p.nationality })) }));
server.get('/v1/search', async (req, reply) => {
  const { q } = req.query as Record<string, string>;
  if (!q || q.trim().length < 2) return reply.status(400).send({ error: 'Query too short' });
  return { version: 'v1', query: q, results: search.search(q, 10) };
});

// ─── Narrative generator ──────────────────────────────────────────────────────
function generateNarrative(match: { status: string; kickoffAt: string; homeScore: number | null; awayScore: number | null }, home = 'Home', away = 'Away', competition = 'the league') {
  const kickoff = new Date(match.kickoffAt);
  const dateStr = kickoff.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
  const timeStr = kickoff.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

  if (match.status === 'scheduled') {
    return { type: 'preview', headline: `${home} host ${away} in ${competition} clash`, body: `${home} welcome ${away} on ${dateStr} (${timeStr} UTC). Both sides will be eager to claim the three points in what promises to be a compelling ${competition} encounter.`, tags: [home, away, competition, 'preview'] };
  }
  if (match.status === 'finished' && match.homeScore != null) {
    const winner = match.homeScore > match.awayScore! ? home : match.homeScore < match.awayScore! ? away : null;
    const scoreStr = `${match.homeScore}–${match.awayScore}`;
    return {
      type: 'report',
      headline: winner ? `${winner} claim victory with ${scoreStr} win in ${competition}` : `${home} and ${away} share the spoils in ${scoreStr} draw`,
      body: winner ? `${winner} secured three crucial points with a ${scoreStr} ${competition} victory on ${dateStr}. The result moves them further up the standings.` : `${home} and ${away} played out an evenly-contested ${scoreStr} draw in ${competition} on ${dateStr}. Both managers will see positives to take from a hard-fought point.`,
      tags: [home, away, competition, 'match-report']
    };
  }
  return { type: 'update', headline: `${home} vs ${away} — ${match.status}`, body: `${home} take on ${away} in ${competition}. Status: ${match.status}.`, tags: [home, away, competition] };
}

// ─── Start ────────────────────────────────────────────────────────────────────
const port = Number(process.env['PORT'] ?? 3001);
await server.listen({ port, host: '0.0.0.0' });
console.log(`\n  Footie API  →  http://localhost:${port}`);
console.log(`  DB          →  ${process.env['FOOTIE_DB_PATH']}\n`);
