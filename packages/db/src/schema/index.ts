import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const competitions = sqliteTable('competitions', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  countryCode: text('country_code'),
  level: integer('level'),
  createdAt: text('created_at').notNull()
});

export const seasons = sqliteTable('seasons', {
  id: text('id').primaryKey(),
  competitionId: text('competition_id').notNull().references(() => competitions.id),
  label: text('label').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  isCurrent: integer('is_current', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull()
});

export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  countryCode: text('country_code'),
  createdAt: text('created_at').notNull()
});

export const players = sqliteTable('players', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  displayName: text('display_name').notNull(),
  primaryPosition: text('primary_position'),
  birthDate: text('birth_date'),
  nationality: text('nationality'),
  createdAt: text('created_at').notNull()
});

export const matches = sqliteTable('matches', {
  id: text('id').primaryKey(),
  seasonId: text('season_id').notNull().references(() => seasons.id),
  competitionId: text('competition_id').notNull().references(() => competitions.id),
  kickoffAt: text('kickoff_at').notNull(),
  homeTeamId: text('home_team_id').notNull().references(() => teams.id),
  awayTeamId: text('away_team_id').notNull().references(() => teams.id),
  status: text('status', { enum: ['scheduled', 'live', 'paused', 'finished', 'postponed', 'cancelled'] }).notNull(),
  homeScore: integer('home_score'),
  awayScore: integer('away_score'),
  minutePlayed: integer('minute_played'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull()
});

export const providerMappings = sqliteTable('provider_mappings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  canonicalId: text('canonical_id').notNull(),
  entityType: text('entity_type', { enum: ['competition', 'season', 'team', 'player', 'match'] }).notNull(),
  provider: text('provider').notNull(),
  providerEntityId: text('provider_entity_id').notNull(),
  confidence: real('confidence').notNull().default(1.0),
  fetchedAt: text('fetched_at').notNull()
});

export const validationIssues = sqliteTable('validation_issues', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  batchId: text('batch_id').notNull(),
  code: text('code').notNull(),
  severity: text('severity', { enum: ['info', 'warning', 'error'] }).notNull(),
  entityId: text('entity_id'),
  message: text('message').notNull(),
  createdAt: text('created_at').notNull()
});

export const publishRecords = sqliteTable('publish_records', {
  recordId: text('record_id').primaryKey(),
  batchId: text('batch_id').notNull(),
  promotedAt: text('promoted_at').notNull(),
  entityCount: integer('entity_count').notNull(),
  validationIssueCount: integer('validation_issue_count').notNull()
});

// FTS5 virtual table — created via raw SQL in migrate.ts
export const searchIndex = sqliteTable('search_index', {
  entityId: text('entity_id').notNull(),
  entityType: text('entity_type').notNull(),
  displayName: text('display_name').notNull(),
  keywords: text('keywords').notNull()
});
