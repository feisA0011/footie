import Database from 'better-sqlite3';
import { resolve } from 'node:path';
import { createCanonicalId } from '@footie/domain';

const DB_PATH = process.env['FOOTIE_DB_PATH'] ?? resolve(process.cwd(), 'footie.db');
const NOW = new Date().toISOString();

// ─── Seed data ───────────────────────────────────────────────────────────────

const COMPETITIONS = [
  { slug: 'premier-league', name: 'Premier League', countryCode: 'ENG', level: 1 },
  { slug: 'la-liga', name: 'La Liga', countryCode: 'ESP', level: 1 },
  { slug: 'champions-league', name: 'UEFA Champions League', countryCode: null, level: null },
  { slug: 'bundesliga', name: 'Bundesliga', countryCode: 'DEU', level: 1 },
  { slug: 'serie-a', name: 'Serie A', countryCode: 'ITA', level: 1 }
];

const TEAMS = [
  // PL
  { slug: 'arsenal', name: 'Arsenal', countryCode: 'ENG' },
  { slug: 'chelsea', name: 'Chelsea', countryCode: 'ENG' },
  { slug: 'manchester-city', name: 'Manchester City', countryCode: 'ENG' },
  { slug: 'liverpool', name: 'Liverpool', countryCode: 'ENG' },
  { slug: 'tottenham', name: 'Tottenham Hotspur', countryCode: 'ENG' },
  { slug: 'manchester-united', name: 'Manchester United', countryCode: 'ENG' },
  { slug: 'newcastle', name: 'Newcastle United', countryCode: 'ENG' },
  { slug: 'aston-villa', name: 'Aston Villa', countryCode: 'ENG' },
  // La Liga
  { slug: 'real-madrid', name: 'Real Madrid', countryCode: 'ESP' },
  { slug: 'barcelona', name: 'FC Barcelona', countryCode: 'ESP' },
  { slug: 'atletico-madrid', name: 'Atlético de Madrid', countryCode: 'ESP' },
  // Bundesliga
  { slug: 'bayern-munich', name: 'Bayern Munich', countryCode: 'DEU' },
  { slug: 'borussia-dortmund', name: 'Borussia Dortmund', countryCode: 'DEU' },
  // Serie A
  { slug: 'inter-milan', name: 'Inter Milan', countryCode: 'ITA' },
  { slug: 'ac-milan', name: 'AC Milan', countryCode: 'ITA' },
  { slug: 'juventus', name: 'Juventus', countryCode: 'ITA' }
];

const PLAYERS = [
  { slug: 'bukayo-saka', displayName: 'Bukayo Saka', primaryPosition: 'RW', birthDate: '2001-09-05', nationality: 'ENG' },
  { slug: 'erling-haaland', displayName: 'Erling Haaland', primaryPosition: 'ST', birthDate: '2000-07-21', nationality: 'NOR' },
  { slug: 'kylian-mbappe', displayName: 'Kylian Mbappé', primaryPosition: 'ST', birthDate: '1998-12-20', nationality: 'FRA' },
  { slug: 'jude-bellingham', displayName: 'Jude Bellingham', primaryPosition: 'CM', birthDate: '2003-06-29', nationality: 'ENG' },
  { slug: 'vinicius-jr', displayName: 'Vinícius Jr.', primaryPosition: 'LW', birthDate: '2000-07-12', nationality: 'BRA' },
  { slug: 'pedri', displayName: 'Pedri', primaryPosition: 'CM', birthDate: '2002-11-25', nationality: 'ESP' },
  { slug: 'martin-odegaard', displayName: 'Martin Ødegaard', primaryPosition: 'AM', birthDate: '1998-12-17', nationality: 'NOR' },
  { slug: 'harry-kane', displayName: 'Harry Kane', primaryPosition: 'ST', birthDate: '1993-07-28', nationality: 'ENG' },
  { slug: 'trent-alexander-arnold', displayName: 'Trent Alexander-Arnold', primaryPosition: 'RB', birthDate: '1998-10-07', nationality: 'ENG' },
  { slug: 'lamine-yamal', displayName: 'Lamine Yamal', primaryPosition: 'RW', birthDate: '2007-07-13', nationality: 'ESP' }
];

// Matches with realistic data
const FIXTURE_MATCHES = [
  // PL matchday 29
  { comp: 'premier-league', season: '2025-26', home: 'arsenal', away: 'chelsea', kickoff: '2026-03-19T19:45:00Z', status: 'scheduled' as const },
  { comp: 'premier-league', season: '2025-26', home: 'manchester-city', away: 'liverpool', kickoff: '2026-03-19T17:30:00Z', status: 'finished' as const, homeScore: 2, awayScore: 1 },
  { comp: 'premier-league', season: '2025-26', home: 'tottenham', away: 'aston-villa', kickoff: '2026-03-20T20:00:00Z', status: 'scheduled' as const },
  { comp: 'premier-league', season: '2025-26', home: 'newcastle', away: 'manchester-united', kickoff: '2026-03-22T14:00:00Z', status: 'scheduled' as const },
  // La Liga
  { comp: 'la-liga', season: '2025-26', home: 'real-madrid', away: 'barcelona', kickoff: '2026-03-22T20:00:00Z', status: 'scheduled' as const },
  { comp: 'la-liga', season: '2025-26', home: 'atletico-madrid', away: 'real-madrid', kickoff: '2026-03-15T20:00:00Z', status: 'finished' as const, homeScore: 1, awayScore: 1 },
  // Champions League
  { comp: 'champions-league', season: '2025-26', home: 'arsenal', away: 'real-madrid', kickoff: '2026-04-08T20:00:00Z', status: 'scheduled' as const },
  { comp: 'champions-league', season: '2025-26', home: 'manchester-city', away: 'bayern-munich', kickoff: '2026-04-09T20:00:00Z', status: 'scheduled' as const },
  // Bundesliga
  { comp: 'bundesliga', season: '2025-26', home: 'bayern-munich', away: 'borussia-dortmund', kickoff: '2026-03-21T17:30:00Z', status: 'scheduled' as const },
  // Serie A
  { comp: 'serie-a', season: '2025-26', home: 'inter-milan', away: 'ac-milan', kickoff: '2026-03-23T19:45:00Z', status: 'scheduled' as const },
  { comp: 'serie-a', season: '2025-26', home: 'juventus', away: 'inter-milan', kickoff: '2026-03-16T19:45:00Z', status: 'finished' as const, homeScore: 0, awayScore: 2 }
];

// ─── Run seed ────────────────────────────────────────────────────────────────

const seed = () => {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Competitions
  const upsertComp = db.prepare(`
    INSERT INTO competitions (id, slug, name, country_code, level, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name
  `);
  const compIds: Record<string, string> = {};
  for (const c of COMPETITIONS) {
    const id = createCanonicalId('competition', c.slug);
    compIds[c.slug] = id;
    upsertComp.run(id, c.slug, c.name, c.countryCode ?? null, c.level ?? null, NOW);
  }

  // Seasons
  const upsertSeason = db.prepare(`
    INSERT INTO seasons (id, competition_id, label, start_date, end_date, is_current, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET is_current=excluded.is_current
  `);
  const seasonIds: Record<string, string> = {};
  for (const comp of COMPETITIONS) {
    const id = createCanonicalId('season', `${comp.slug}-2025-26`);
    seasonIds[comp.slug] = id;
    upsertSeason.run(id, compIds[comp.slug], '2025-26', '2025-08-01', '2026-05-31', 1, NOW);
  }

  // Teams
  const upsertTeam = db.prepare(`
    INSERT INTO teams (id, slug, name, country_code, created_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name
  `);
  const teamIds: Record<string, string> = {};
  for (const t of TEAMS) {
    const id = createCanonicalId('team', t.slug);
    teamIds[t.slug] = id;
    upsertTeam.run(id, t.slug, t.name, t.countryCode, NOW);
  }

  // Players
  const upsertPlayer = db.prepare(`
    INSERT INTO players (id, slug, display_name, primary_position, birth_date, nationality, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET display_name=excluded.display_name, primary_position=excluded.primary_position
  `);
  for (const p of PLAYERS) {
    const id = createCanonicalId('player', p.slug);
    upsertPlayer.run(id, p.slug, p.displayName, p.primaryPosition, p.birthDate, p.nationality, NOW);
  }

  // Matches
  const upsertMatch = db.prepare(`
    INSERT INTO matches (id, season_id, competition_id, kickoff_at, home_team_id, away_team_id, status, home_score, away_score, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET status=excluded.status, home_score=excluded.home_score, away_score=excluded.away_score, updated_at=excluded.updated_at
  `);
  for (const m of FIXTURE_MATCHES) {
    const id = createCanonicalId('match', `${m.kickoff}-${m.home}-${m.away}`);
    upsertMatch.run(
      id, seasonIds[m.comp], compIds[m.comp], m.kickoff,
      teamIds[m.home], teamIds[m.away],
      m.status, m.homeScore ?? null, m.awayScore ?? null, NOW, NOW
    );
  }

  // Rebuild FTS index
  db.prepare(`DELETE FROM search_fts`).run();
  const indexFts = db.prepare(`INSERT INTO search_fts(entity_id, entity_type, display_name, keywords) VALUES (?, ?, ?, ?)`);

  const allTeams = db.prepare(`SELECT id, slug, name FROM teams`).all() as { id: string; slug: string; name: string }[];
  for (const t of allTeams) {
    indexFts.run(t.id, 'team', t.name, `${t.name} ${t.slug.replaceAll('-', ' ')}`);
  }

  const allPlayers = db.prepare(`SELECT id, slug, display_name, primary_position, nationality FROM players`).all() as { id: string; slug: string; display_name: string; primary_position: string; nationality: string }[];
  for (const p of allPlayers) {
    indexFts.run(p.id, 'player', p.display_name, `${p.display_name} ${p.slug.replaceAll('-', ' ')} ${p.primary_position ?? ''} ${p.nationality ?? ''}`);
  }

  const allComps = db.prepare(`SELECT id, slug, name FROM competitions`).all() as { id: string; slug: string; name: string }[];
  for (const c of allComps) {
    indexFts.run(c.id, 'competition', c.name, `${c.name} ${c.slug.replaceAll('-', ' ')}`);
  }

  db.close();
  console.log(`Seeded: ${COMPETITIONS.length} competitions, ${TEAMS.length} teams, ${PLAYERS.length} players, ${FIXTURE_MATCHES.length} matches`);
};

seed();
