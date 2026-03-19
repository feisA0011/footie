import Database from 'better-sqlite3';
import { resolve } from 'node:path';
import { createCanonicalId } from '@footie/domain';

const DB_PATH = process.env['FOOTIE_DB_PATH'] ?? resolve(process.cwd(), 'footie.db');
const NOW = new Date().toISOString();

// ─── Competitions ─────────────────────────────────────────────────────────────
const COMPETITIONS = [
  { slug: 'premier-league', name: 'Premier League', countryCode: 'ENG', level: 1 },
  { slug: 'la-liga', name: 'La Liga', countryCode: 'ESP', level: 1 },
  { slug: 'champions-league', name: 'UEFA Champions League', countryCode: null, level: null },
  { slug: 'bundesliga', name: 'Bundesliga', countryCode: 'DEU', level: 1 },
  { slug: 'serie-a', name: 'Serie A', countryCode: 'ITA', level: 1 }
];

// ─── Teams ────────────────────────────────────────────────────────────────────
const TEAMS = [
  // Premier League (20 teams)
  { slug: 'arsenal', name: 'Arsenal', countryCode: 'ENG' },
  { slug: 'chelsea', name: 'Chelsea', countryCode: 'ENG' },
  { slug: 'manchester-city', name: 'Manchester City', countryCode: 'ENG' },
  { slug: 'liverpool', name: 'Liverpool', countryCode: 'ENG' },
  { slug: 'tottenham', name: 'Tottenham Hotspur', countryCode: 'ENG' },
  { slug: 'manchester-united', name: 'Manchester United', countryCode: 'ENG' },
  { slug: 'newcastle', name: 'Newcastle United', countryCode: 'ENG' },
  { slug: 'aston-villa', name: 'Aston Villa', countryCode: 'ENG' },
  { slug: 'brighton', name: 'Brighton & Hove Albion', countryCode: 'ENG' },
  { slug: 'west-ham', name: 'West Ham United', countryCode: 'ENG' },
  { slug: 'fulham', name: 'Fulham', countryCode: 'ENG' },
  { slug: 'brentford', name: 'Brentford', countryCode: 'ENG' },
  { slug: 'crystal-palace', name: 'Crystal Palace', countryCode: 'ENG' },
  { slug: 'everton', name: 'Everton', countryCode: 'ENG' },
  { slug: 'wolverhampton', name: 'Wolverhampton Wanderers', countryCode: 'ENG' },
  { slug: 'nottingham-forest', name: 'Nottingham Forest', countryCode: 'ENG' },
  { slug: 'bournemouth', name: 'AFC Bournemouth', countryCode: 'ENG' },
  { slug: 'leicester', name: 'Leicester City', countryCode: 'ENG' },
  { slug: 'ipswich', name: 'Ipswich Town', countryCode: 'ENG' },
  { slug: 'southampton', name: 'Southampton', countryCode: 'ENG' },
  // La Liga
  { slug: 'real-madrid', name: 'Real Madrid', countryCode: 'ESP' },
  { slug: 'barcelona', name: 'FC Barcelona', countryCode: 'ESP' },
  { slug: 'atletico-madrid', name: 'Atlético de Madrid', countryCode: 'ESP' },
  { slug: 'sevilla', name: 'Sevilla FC', countryCode: 'ESP' },
  // Bundesliga
  { slug: 'bayern-munich', name: 'Bayern Munich', countryCode: 'DEU' },
  { slug: 'borussia-dortmund', name: 'Borussia Dortmund', countryCode: 'DEU' },
  { slug: 'bayer-leverkusen', name: 'Bayer Leverkusen', countryCode: 'DEU' },
  // Serie A
  { slug: 'inter-milan', name: 'Inter Milan', countryCode: 'ITA' },
  { slug: 'ac-milan', name: 'AC Milan', countryCode: 'ITA' },
  { slug: 'juventus', name: 'Juventus', countryCode: 'ITA' },
  { slug: 'napoli', name: 'SSC Napoli', countryCode: 'ITA' }
];

// ─── Players ──────────────────────────────────────────────────────────────────
const PLAYERS = [
  { slug: 'bukayo-saka', displayName: 'Bukayo Saka', primaryPosition: 'RW', birthDate: '2001-09-05', nationality: 'ENG', teamSlug: 'arsenal', goals: 14, assists: 9 },
  { slug: 'martin-odegaard', displayName: 'Martin Ødegaard', primaryPosition: 'AM', birthDate: '1998-12-17', nationality: 'NOR', teamSlug: 'arsenal', goals: 8, assists: 7 },
  { slug: 'erling-haaland', displayName: 'Erling Haaland', primaryPosition: 'ST', birthDate: '2000-07-21', nationality: 'NOR', teamSlug: 'manchester-city', goals: 22, assists: 5 },
  { slug: 'kevin-de-bruyne', displayName: 'Kevin De Bruyne', primaryPosition: 'CM', birthDate: '1991-06-28', nationality: 'BEL', teamSlug: 'manchester-city', goals: 4, assists: 16 },
  { slug: 'mohamed-salah', displayName: 'Mohamed Salah', primaryPosition: 'RW', birthDate: '1992-06-15', nationality: 'EGY', teamSlug: 'liverpool', goals: 19, assists: 12 },
  { slug: 'trent-alexander-arnold', displayName: 'Trent Alexander-Arnold', primaryPosition: 'RB', birthDate: '1998-10-07', nationality: 'ENG', teamSlug: 'liverpool', goals: 3, assists: 11 },
  { slug: 'kylian-mbappe', displayName: 'Kylian Mbappé', primaryPosition: 'ST', birthDate: '1998-12-20', nationality: 'FRA', teamSlug: 'real-madrid', goals: 26, assists: 8 },
  { slug: 'vinicius-jr', displayName: 'Vinícius Jr.', primaryPosition: 'LW', birthDate: '2000-07-12', nationality: 'BRA', teamSlug: 'real-madrid', goals: 18, assists: 9 },
  { slug: 'jude-bellingham', displayName: 'Jude Bellingham', primaryPosition: 'CM', birthDate: '2003-06-29', nationality: 'ENG', teamSlug: 'real-madrid', goals: 12, assists: 7 },
  { slug: 'pedri', displayName: 'Pedri', primaryPosition: 'CM', birthDate: '2002-11-25', nationality: 'ESP', teamSlug: 'barcelona', goals: 6, assists: 10 },
  { slug: 'lamine-yamal', displayName: 'Lamine Yamal', primaryPosition: 'RW', birthDate: '2007-07-13', nationality: 'ESP', teamSlug: 'barcelona', goals: 11, assists: 13 },
  { slug: 'harry-kane', displayName: 'Harry Kane', primaryPosition: 'ST', birthDate: '1993-07-28', nationality: 'ENG', teamSlug: 'bayern-munich', goals: 24, assists: 6 },
  { slug: 'cole-palmer', displayName: 'Cole Palmer', primaryPosition: 'AM', birthDate: '2002-05-06', nationality: 'ENG', teamSlug: 'chelsea', goals: 16, assists: 11 },
  { slug: 'alexander-isak', displayName: 'Alexander Isak', primaryPosition: 'ST', birthDate: '1999-09-21', nationality: 'SWE', teamSlug: 'newcastle', goals: 18, assists: 3 },
  { slug: 'ollie-watkins', displayName: 'Ollie Watkins', primaryPosition: 'ST', birthDate: '1995-12-30', nationality: 'ENG', teamSlug: 'aston-villa', goals: 13, assists: 8 }
];

// ─── PL results (matchdays 1-28) ──────────────────────────────────────────────
// Realistic 2025-26 PL season snapshot, MD29 upcoming
const PL_RESULTS: { home: string; away: string; kickoff: string; hs: number; as: number }[] = [
  // MD1
  { home: 'arsenal', away: 'wolverhampton', kickoff: '2025-08-16T14:00:00Z', hs: 2, as: 0 },
  { home: 'manchester-city', away: 'chelsea', kickoff: '2025-08-16T16:30:00Z', hs: 1, as: 1 },
  { home: 'liverpool', away: 'ipswich', kickoff: '2025-08-16T14:00:00Z', hs: 3, as: 0 },
  { home: 'tottenham', away: 'leicester', kickoff: '2025-08-16T14:00:00Z', hs: 2, as: 1 },
  { home: 'newcastle', away: 'southampton', kickoff: '2025-08-16T14:00:00Z', hs: 4, as: 0 },
  { home: 'aston-villa', away: 'west-ham', kickoff: '2025-08-16T14:00:00Z', hs: 3, as: 1 },
  { home: 'brighton', away: 'everton', kickoff: '2025-08-16T14:00:00Z', hs: 1, as: 1 },
  { home: 'nottingham-forest', away: 'brentford', kickoff: '2025-08-16T14:00:00Z', hs: 0, as: 2 },
  { home: 'fulham', away: 'crystal-palace', kickoff: '2025-08-16T14:00:00Z', hs: 1, as: 0 },
  { home: 'bournemouth', away: 'manchester-united', kickoff: '2025-08-16T14:00:00Z', hs: 2, as: 1 },
  // MD2
  { home: 'chelsea', away: 'arsenal', kickoff: '2025-08-23T14:00:00Z', hs: 0, as: 1 },
  { home: 'wolverhampton', away: 'liverpool', kickoff: '2025-08-23T14:00:00Z', hs: 0, as: 3 },
  { home: 'leicester', away: 'manchester-city', kickoff: '2025-08-23T14:00:00Z', hs: 0, as: 4 },
  { home: 'ipswich', away: 'newcastle', kickoff: '2025-08-23T14:00:00Z', hs: 1, as: 2 },
  { home: 'manchester-united', away: 'brighton', kickoff: '2025-08-23T14:00:00Z', hs: 1, as: 2 },
  { home: 'everton', away: 'aston-villa', kickoff: '2025-08-23T14:00:00Z', hs: 0, as: 2 },
  { home: 'west-ham', away: 'tottenham', kickoff: '2025-08-23T14:00:00Z', hs: 1, as: 3 },
  { home: 'brentford', away: 'fulham', kickoff: '2025-08-23T14:00:00Z', hs: 2, as: 1 },
  { home: 'crystal-palace', away: 'bournemouth', kickoff: '2025-08-23T14:00:00Z', hs: 1, as: 0 },
  { home: 'southampton', away: 'nottingham-forest', kickoff: '2025-08-23T14:00:00Z', hs: 0, as: 2 },
  // MD3-10 (condensed)
  { home: 'arsenal', away: 'brighton', kickoff: '2025-08-30T14:00:00Z', hs: 2, as: 1 },
  { home: 'liverpool', away: 'manchester-city', kickoff: '2025-08-30T16:30:00Z', hs: 1, as: 0 },
  { home: 'newcastle', away: 'tottenham', kickoff: '2025-08-30T14:00:00Z', hs: 2, as: 2 },
  { home: 'manchester-city', away: 'nottingham-forest', kickoff: '2025-09-14T14:00:00Z', hs: 5, as: 1 },
  { home: 'arsenal', away: 'leicester', kickoff: '2025-09-14T14:00:00Z', hs: 3, as: 0 },
  { home: 'liverpool', away: 'chelsea', kickoff: '2025-09-21T16:30:00Z', hs: 2, as: 0 },
  { home: 'newcastle', away: 'manchester-city', kickoff: '2025-09-28T14:00:00Z', hs: 1, as: 1 },
  { home: 'tottenham', away: 'arsenal', kickoff: '2025-10-12T16:30:00Z', hs: 1, as: 2 },
  { home: 'manchester-city', away: 'liverpool', kickoff: '2025-10-25T16:30:00Z', hs: 2, as: 1 },
  { home: 'arsenal', away: 'chelsea', kickoff: '2025-11-01T17:30:00Z', hs: 3, as: 1 },
  { home: 'liverpool', away: 'aston-villa', kickoff: '2025-11-08T15:00:00Z', hs: 2, as: 1 },
  { home: 'newcastle', away: 'chelsea', kickoff: '2025-11-22T15:00:00Z', hs: 1, as: 2 },
  { home: 'arsenal', away: 'nottingham-forest', kickoff: '2025-11-29T15:00:00Z', hs: 3, as: 1 },
  { home: 'manchester-city', away: 'tottenham', kickoff: '2025-12-06T15:00:00Z', hs: 4, as: 0 },
  { home: 'liverpool', away: 'brighton', kickoff: '2025-12-13T15:00:00Z', hs: 3, as: 1 },
  { home: 'chelsea', away: 'newcastle', kickoff: '2025-12-20T15:00:00Z', hs: 1, as: 1 },
  { home: 'tottenham', away: 'manchester-united', kickoff: '2025-12-26T12:30:00Z', hs: 3, as: 0 },
  { home: 'arsenal', away: 'aston-villa', kickoff: '2025-12-26T15:00:00Z', hs: 2, as: 0 },
  { home: 'manchester-city', away: 'brighton', kickoff: '2026-01-04T17:30:00Z', hs: 3, as: 1 },
  { home: 'liverpool', away: 'manchester-united', kickoff: '2026-01-04T17:30:00Z', hs: 2, as: 0 },
  { home: 'aston-villa', away: 'tottenham', kickoff: '2026-01-18T15:00:00Z', hs: 1, as: 2 },
  { home: 'chelsea', away: 'liverpool', kickoff: '2026-01-25T16:30:00Z', hs: 1, as: 2 },
  { home: 'arsenal', away: 'manchester-city', kickoff: '2026-02-01T17:30:00Z', hs: 2, as: 2 },
  { home: 'newcastle', away: 'aston-villa', kickoff: '2026-02-15T15:00:00Z', hs: 3, as: 0 },
  { home: 'manchester-united', away: 'arsenal', kickoff: '2026-02-22T16:30:00Z', hs: 0, as: 3 },
  { home: 'brighton', away: 'manchester-city', kickoff: '2026-03-01T15:00:00Z', hs: 1, as: 2 },
  { home: 'tottenham', away: 'chelsea', kickoff: '2026-03-08T16:30:00Z', hs: 2, as: 1 },
  { home: 'liverpool', away: 'newcastle', kickoff: '2026-03-14T17:30:00Z', hs: 2, as: 1 },
  { home: 'manchester-city', away: 'liverpool', kickoff: '2026-03-19T17:30:00Z', hs: 2, as: 1 },
  // MD29 (upcoming)
  { home: 'arsenal', away: 'chelsea', kickoff: '2026-03-19T19:45:00Z', hs: -1, as: -1 }, // scheduled
  { home: 'tottenham', away: 'aston-villa', kickoff: '2026-03-20T20:00:00Z', hs: -1, as: -1 },
  { home: 'newcastle', away: 'manchester-united', kickoff: '2026-03-22T14:00:00Z', hs: -1, as: -1 },
];

// ─── Other competitions ────────────────────────────────────────────────────────
const OTHER_MATCHES = [
  { comp: 'la-liga', home: 'real-madrid', away: 'barcelona', kickoff: '2026-03-22T20:00:00Z', hs: -1, as: -1 },
  { comp: 'la-liga', home: 'atletico-madrid', away: 'real-madrid', kickoff: '2026-03-15T20:00:00Z', hs: 1, as: 1 },
  { comp: 'la-liga', home: 'barcelona', away: 'sevilla', kickoff: '2026-03-08T20:00:00Z', hs: 4, as: 1 },
  { comp: 'champions-league', home: 'arsenal', away: 'real-madrid', kickoff: '2026-04-08T20:00:00Z', hs: -1, as: -1 },
  { comp: 'champions-league', home: 'manchester-city', away: 'bayern-munich', kickoff: '2026-04-09T20:00:00Z', hs: -1, as: -1 },
  { comp: 'champions-league', home: 'liverpool', away: 'barcelona', kickoff: '2026-04-15T20:00:00Z', hs: -1, as: -1 },
  { comp: 'bundesliga', home: 'bayern-munich', away: 'borussia-dortmund', kickoff: '2026-03-21T17:30:00Z', hs: -1, as: -1 },
  { comp: 'bundesliga', home: 'bayer-leverkusen', away: 'bayern-munich', kickoff: '2026-03-07T17:30:00Z', hs: 2, as: 3 },
  { comp: 'serie-a', home: 'inter-milan', away: 'ac-milan', kickoff: '2026-03-23T19:45:00Z', hs: -1, as: -1 },
  { comp: 'serie-a', home: 'juventus', away: 'inter-milan', kickoff: '2026-03-16T19:45:00Z', hs: 0, as: 2 },
  { comp: 'serie-a', home: 'napoli', away: 'juventus', kickoff: '2026-03-09T19:45:00Z', hs: 1, as: 0 },
];

// ─── Seed ─────────────────────────────────────────────────────────────────────
const seed = () => {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Competitions
  const upsertComp = db.prepare(`INSERT INTO competitions (id, slug, name, country_code, level, created_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name`);
  const compIds: Record<string, string> = {};
  for (const c of COMPETITIONS) {
    const id = createCanonicalId('competition', c.slug);
    compIds[c.slug] = id;
    upsertComp.run(id, c.slug, c.name, c.countryCode ?? null, c.level ?? null, NOW);
  }

  // Seasons
  const upsertSeason = db.prepare(`INSERT INTO seasons (id, competition_id, label, start_date, end_date, is_current, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET is_current=excluded.is_current`);
  const seasonIds: Record<string, string> = {};
  for (const comp of COMPETITIONS) {
    const id = createCanonicalId('season', `${comp.slug}-2025-26`);
    seasonIds[comp.slug] = id;
    upsertSeason.run(id, compIds[comp.slug], '2025-26', '2025-08-01', '2026-05-31', 1, NOW);
  }

  // Teams
  const upsertTeam = db.prepare(`INSERT INTO teams (id, slug, name, country_code, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name`);
  const teamIds: Record<string, string> = {};
  for (const t of TEAMS) {
    const id = createCanonicalId('team', t.slug);
    teamIds[t.slug] = id;
    upsertTeam.run(id, t.slug, t.name, t.countryCode, NOW);
  }

  // Players
  const upsertPlayer = db.prepare(`INSERT INTO players (id, slug, display_name, primary_position, birth_date, nationality, created_at) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET display_name=excluded.display_name`);
  for (const p of PLAYERS) {
    const id = createCanonicalId('player', p.slug);
    upsertPlayer.run(id, p.slug, p.displayName, p.primaryPosition, p.birthDate, p.nationality, NOW);
  }

  // PL matches
  const upsertMatch = db.prepare(`INSERT INTO matches (id, season_id, competition_id, kickoff_at, home_team_id, away_team_id, status, home_score, away_score, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET status=excluded.status, home_score=excluded.home_score, away_score=excluded.away_score, updated_at=excluded.updated_at`);

  let matchCount = 0;
  for (const m of PL_RESULTS) {
    const finished = m.hs >= 0;
    const id = createCanonicalId('match', `${m.kickoff}-${m.home}-${m.away}`);
    upsertMatch.run(id, seasonIds['premier-league'], compIds['premier-league'], m.kickoff, teamIds[m.home], teamIds[m.away], finished ? 'finished' : 'scheduled', finished ? m.hs : null, finished ? m.as : null, NOW, NOW);
    matchCount++;
  }

  for (const m of OTHER_MATCHES) {
    const finished = m.hs >= 0;
    const id = createCanonicalId('match', `${m.kickoff}-${m.home}-${m.away}`);
    upsertMatch.run(id, seasonIds[m.comp], compIds[m.comp], m.kickoff, teamIds[m.home], teamIds[m.away], finished ? 'finished' : 'scheduled', finished ? m.hs : null, finished ? m.as : null, NOW, NOW);
    matchCount++;
  }

  // Rebuild FTS
  db.prepare(`DELETE FROM search_fts`).run();
  const indexFts = db.prepare(`INSERT INTO search_fts(entity_id, entity_type, display_name, keywords) VALUES (?, ?, ?, ?)`);
  for (const t of TEAMS) {
    const id = teamIds[t.slug];
    if (id) indexFts.run(id, 'team', t.name, `${t.name} ${t.slug.replaceAll('-', ' ')}`);
  }
  for (const p of PLAYERS) {
    const id = createCanonicalId('player', p.slug);
    indexFts.run(id, 'player', p.displayName, `${p.displayName} ${p.slug.replaceAll('-', ' ')} ${p.primaryPosition ?? ''} ${p.nationality ?? ''}`);
  }
  for (const c of COMPETITIONS) {
    const id = compIds[c.slug];
    if (id) indexFts.run(id, 'competition', c.name, `${c.name} ${c.slug.replaceAll('-', ' ')}`);
  }

  db.close();
  console.log(`Seeded: ${COMPETITIONS.length} comps, ${TEAMS.length} teams, ${PLAYERS.length} players, ${matchCount} matches`);
};

seed();
