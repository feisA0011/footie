import { eq } from 'drizzle-orm';
import type { Db } from '../client.js';
import { managers, managerStints, teams } from '../schema/index.js';

export const managerRepo = (db: Db) => ({
  findAll: () =>
    db.select({
      manager: managers,
      team: { id: teams.id, slug: teams.slug, name: teams.name, primaryColor: teams.primaryColor }
    })
    .from(managers)
    .leftJoin(teams, eq(managers.currentTeamId, teams.id))
    .all(),

  findBySlug: (slug: string) =>
    db.select({
      manager: managers,
      team: { id: teams.id, slug: teams.slug, name: teams.name, primaryColor: teams.primaryColor }
    })
    .from(managers)
    .leftJoin(teams, eq(managers.currentTeamId, teams.id))
    .where(eq(managers.slug, slug))
    .get(),

  getStints: (managerId: string) =>
    db.select({
      stint: managerStints,
      team: { id: teams.id, slug: teams.slug, name: teams.name, primaryColor: teams.primaryColor }
    })
    .from(managerStints)
    .leftJoin(teams, eq(managerStints.teamId, teams.id))
    .where(eq(managerStints.managerId, managerId))
    .all()
});
