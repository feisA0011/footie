import { eq, desc, and, or, like } from 'drizzle-orm';
import type { Db } from '../client.js';
import { competitions, matches, players, seasons, teams } from '../schema/index.js';

export const matchRepo = (db: Db) => ({
  findAll: (limit = 50) =>
    db
      .select({
        match: matches,
        homeTeam: teams,
        awayTeam: { id: teams.id, slug: teams.slug, name: teams.name },
        competition: competitions,
        season: seasons
      })
      .from(matches)
      .leftJoin(competitions, eq(matches.competitionId, competitions.id))
      .leftJoin(seasons, eq(matches.seasonId, seasons.id))
      .leftJoin(teams, eq(matches.homeTeamId, teams.id))
      .orderBy(desc(matches.kickoffAt))
      .limit(limit)
      .all(),

  findById: (id: string) =>
    db.select().from(matches).where(eq(matches.id, id)).get(),

  findByStatus: (status: string) =>
    db.select().from(matches).where(eq(matches.status, status as 'scheduled' | 'live' | 'finished')).all(),

  upsert: (match: typeof matches.$inferInsert) =>
    db
      .insert(matches)
      .values(match)
      .onConflictDoUpdate({ target: matches.id, set: { status: match.status, homeScore: match.homeScore, awayScore: match.awayScore, updatedAt: match.updatedAt } })
      .run()
});

export const teamRepo = (db: Db) => ({
  findAll: () => db.select().from(teams).all(),
  findById: (id: string) => db.select().from(teams).where(eq(teams.id, id)).get(),
  upsert: (team: typeof teams.$inferInsert) =>
    db.insert(teams).values(team).onConflictDoUpdate({ target: teams.id, set: { name: team.name, slug: team.slug } }).run()
});

export const competitionRepo = (db: Db) => ({
  findAll: () => db.select().from(competitions).all(),
  findById: (id: string) => db.select().from(competitions).where(eq(competitions.id, id)).get(),
  upsert: (comp: typeof competitions.$inferInsert) =>
    db.insert(competitions).values(comp).onConflictDoUpdate({ target: competitions.id, set: { name: comp.name } }).run()
});

export const seasonRepo = (db: Db) => ({
  findAll: () => db.select().from(seasons).all(),
  upsert: (season: typeof seasons.$inferInsert) =>
    db.insert(seasons).values(season).onConflictDoUpdate({ target: seasons.id, set: { isCurrent: season.isCurrent } }).run()
});

export const playerRepo = (db: Db) => ({
  findAll: () => db.select().from(players).all(),
  upsert: (player: typeof players.$inferInsert) =>
    db.insert(players).values(player).onConflictDoUpdate({ target: players.id, set: { displayName: player.displayName, primaryPosition: player.primaryPosition } }).run()
});
