import { eq } from 'drizzle-orm';
import type { Db } from '../client.js';
import { players, playerStats, playerCareer, teams } from '../schema/index.js';

export const playerDetailRepo = (db: Db) => ({
  findAll: () =>
    db.select({
      player: players,
      team: { id: teams.id, slug: teams.slug, name: teams.name, primaryColor: teams.primaryColor }
    })
    .from(players)
    .leftJoin(teams, eq(players.currentTeamId, teams.id))
    .all(),

  findBySlug: (slug: string) =>
    db.select({
      player: players,
      team: { id: teams.id, slug: teams.slug, name: teams.name, primaryColor: teams.primaryColor }
    })
    .from(players)
    .leftJoin(teams, eq(players.currentTeamId, teams.id))
    .where(eq(players.slug, slug))
    .get(),

  findByTeamId: (teamId: string) =>
    db.select({
      player: players,
      stats: playerStats
    })
    .from(players)
    .leftJoin(playerStats, eq(players.id, playerStats.playerId))
    .where(eq(players.currentTeamId, teamId))
    .all(),

  getStats: (playerId: string) =>
    db.select().from(playerStats).where(eq(playerStats.playerId, playerId)).all(),

  getCareer: (playerId: string) =>
    db.select({
      stint: playerCareer,
      team: { id: teams.id, slug: teams.slug, name: teams.name, primaryColor: teams.primaryColor }
    })
    .from(playerCareer)
    .leftJoin(teams, eq(playerCareer.teamId, teams.id))
    .where(eq(playerCareer.playerId, playerId))
    .all()
});
