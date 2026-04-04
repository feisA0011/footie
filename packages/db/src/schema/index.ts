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

export const managers = sqliteTable('managers', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  nationality: text('nationality'),
  birthDate: text('birth_date'),
  description: text('description'),
  currentTeamId: text('current_team_id'),
  createdAt: text('created_at').notNull()
});

export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  countryCode: text('country_code'),
  founded: integer('founded'),
  stadium: text('stadium'),
  stadiumCapacity: integer('stadium_capacity'),
  nickname: text('nickname'),
  description: text('description'),
  primaryColor: text('primary_color'),
  managerId: text('manager_id'),
  createdAt: text('created_at').notNull()
});

export const players = sqliteTable('players', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  displayName: text('display_name').notNull(),
  primaryPosition: text('primary_position'),
  birthDate: text('birth_date'),
  nationality: text('nationality'),
  currentTeamId: text('current_team_id'),
  heightCm: integer('height_cm'),
  weightKg: integer('weight_kg'),
  description: text('description'),
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

export const playerStats = sqliteTable('player_stats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playerId: text('player_id').notNull().references(() => players.id),
  teamId: text('team_id').notNull().references(() => teams.id),
  seasonLabel: text('season_label').notNull(),
  competitionSlug: text('competition_slug').notNull().default('premier-league'),
  appearances: integer('appearances').notNull().default(0),
  starts: integer('starts').notNull().default(0),
  minutesPlayed: integer('minutes_played').notNull().default(0),
  goals: integer('goals').notNull().default(0),
  assists: integer('assists').notNull().default(0),
  shots: integer('shots').notNull().default(0),
  shotsOnTarget: integer('shots_on_target').notNull().default(0),
  xg: real('xg').notNull().default(0),
  xa: real('xa').notNull().default(0),
  passes: integer('passes').notNull().default(0),
  passAccuracy: real('pass_accuracy').notNull().default(0),
  keyPasses: integer('key_passes').notNull().default(0),
  dribblesCompleted: integer('dribbles_completed').notNull().default(0),
  tackles: integer('tackles').notNull().default(0),
  interceptions: integer('interceptions').notNull().default(0),
  yellowCards: integer('yellow_cards').notNull().default(0),
  redCards: integer('red_cards').notNull().default(0),
  freeKicks: integer('free_kicks').notNull().default(0),
  penaltiesScored: integer('penalties_scored').notNull().default(0),
  penaltiesTaken: integer('penalties_taken').notNull().default(0),
  throwIns: integer('throw_ins').notNull().default(0),
  distanceKm: real('distance_km').notNull().default(0),
  topSpeedKmh: real('top_speed_kmh').notNull().default(0)
});

export const managerStints = sqliteTable('manager_stints', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  managerId: text('manager_id').notNull().references(() => managers.id),
  teamId: text('team_id').notNull().references(() => teams.id),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
  isCurrent: integer('is_current', { mode: 'boolean' }).notNull().default(false),
  matches: integer('matches').notNull().default(0),
  wins: integer('wins').notNull().default(0),
  draws: integer('draws').notNull().default(0),
  losses: integer('losses').notNull().default(0),
  trophies: text('trophies'),
  notes: text('notes')
});

export const playerCareer = sqliteTable('player_career', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  playerId: text('player_id').notNull().references(() => players.id),
  teamId: text('team_id').notNull().references(() => teams.id),
  startedAt: text('started_at').notNull(),
  endedAt: text('ended_at'),
  isCurrent: integer('is_current', { mode: 'boolean' }).notNull().default(false),
  appearances: integer('appearances').notNull().default(0),
  goals: integer('goals').notNull().default(0),
  assists: integer('assists').notNull().default(0)
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
