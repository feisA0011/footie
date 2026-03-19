import type {
  Competition,
  Match,
  Player,
  ProviderMapping,
  PublishRecord,
  Season,
  Team,
  ValidationIssue
} from './entities.js';

export interface CanonicalDataset {
  readonly competitions: readonly Competition[];
  readonly seasons: readonly Season[];
  readonly teams: readonly Team[];
  readonly players: readonly Player[];
  readonly matches: readonly Match[];
  readonly providerMappings: readonly ProviderMapping[];
}

export interface ValidationReport {
  readonly batchId: string;
  readonly issues: readonly ValidationIssue[];
  readonly valid: boolean;
}

export interface PublishableBatch {
  readonly batchId: string;
  readonly dataset: CanonicalDataset;
  readonly validation: ValidationReport;
}

export interface PublishedBatch {
  readonly batch: PublishableBatch;
  readonly publishRecord: PublishRecord;
}
