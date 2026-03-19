import type {
  CanonicalDataset,
  Match,
  ValidationIssue,
  ValidationReport
} from '@footie/domain';

export interface ProviderEnvelope<TPayload = unknown> {
  readonly provider: string;
  readonly entity: 'competition' | 'season' | 'team' | 'player' | 'match';
  readonly providerEntityId: string;
  readonly fetchedAt: string;
  readonly payload: TPayload;
}

export interface IngestionWindow {
  readonly startsAt: string;
  readonly endsAt: string;
  readonly mode: 'historical' | 'incremental' | 'live';
}

export interface IngestionBatch<TPayload = unknown> {
  readonly batchId: string;
  readonly window: IngestionWindow;
  readonly envelopes: readonly ProviderEnvelope<TPayload>[];
}

export interface NormalizationResult {
  readonly batchId: string;
  readonly dataset: CanonicalDataset;
}

export interface ValidationSummary extends ValidationReport {
  readonly matchCount: number;
}

export interface PublishDecision {
  readonly batchId: string;
  readonly publishable: boolean;
  readonly reasons: readonly ValidationIssue[];
}

export interface MatchCandidate extends Match {
  readonly confidenceBand: 'high' | 'medium' | 'low';
}
