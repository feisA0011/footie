import { eq } from 'drizzle-orm';
import type { Db } from '../client.js';
import { teams, managers, matches, competitions, seasons, players, playerStats } from '../schema/index.js';

export const teamDetailRepo = (db: Db) => ({
  findAll: () =>
    db.select({
      team: teams,
      manager: { id: managers.id, slug: managers.slug, name: managers.name, nationality: managers.nationality }
    })
    .from(teams)
    .leftJoin(managers, eq(teams.managerId, managers.id))
    .all(),

  findBySlug: (slug: string) =>
    db.select({
      team: teams,
      manager: { id: managers.id, slug: managers.slug, name: managers.name, nationality: managers.nationality }
    })
    .from(teams)
    .leftJoin(managers, eq(teams.managerId, managers.id))
    .where(eq(teams.slug, slug))
    .get(),

  getSquadWithStats: (teamId: string, seasonLabel: string) =>
    db.select({
      player: players,
      stats: playerStats
    })
    .from(players)
    .leftJoin(
      playerStats,
      eq(players.id, playerStats.playerId)
    )
    .where(eq(players.currentTeamId, teamId))
    .all(),

  getRecentMatches: (teamId: string, limit = 10) =>
    db.select({
      match: matches,
      competition: { id: competitions.id, slug: competitions.slug, name: competitions.name },
      homeTeam: { id: teams.id, slug: teams.slug, name: teams.name },
      awayTeam: { id: teams.id, slug: teams.slug, name: teams.name }
    })
    .from(matches)
    .leftJoin(competitions, eq(matches.competitionId, competitions.id))
    .where(eq(matches.homeTeamId, teamId))
    .orderBy(matches.kickoffAt)
    .limit(limit)
    .all()
});
