import type { IngestionBatch, IngestionWindow, ProviderEnvelope } from '../core/types.js';

export interface ProviderAdapter<TPayload = unknown> {
  readonly provider: string;
  fetchMatches(window: IngestionWindow): Promise<readonly ProviderEnvelope<TPayload>[]>;
}

export const createBatch = <TPayload>(
  batchId: string,
  window: IngestionWindow,
  envelopes: readonly ProviderEnvelope<TPayload>[]
): IngestionBatch<TPayload> => ({
  batchId,
  window,
  envelopes
});
