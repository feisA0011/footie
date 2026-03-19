import type { PublishedBatch, PublishRecord } from '@footie/domain';

import type { NormalizationResult, ValidationSummary } from '../core/types.js';

export const publishValidatedBatch = (
  normalized: NormalizationResult,
  validation: ValidationSummary
): PublishedBatch => {
  if (!validation.valid) {
    throw new Error(`Batch ${normalized.batchId} is not publishable.`);
  }

  const publishRecord: PublishRecord = {
    recordId: `pub_${normalized.batchId}`,
    batchId: normalized.batchId,
    promotedAt: new Date('2026-03-19T00:00:00Z').toISOString(),
    entityIds: normalized.dataset.matches.map((match) => match.id),
    validationIssueCount: validation.issues.length
  };

  return {
    batch: {
      batchId: normalized.batchId,
      dataset: normalized.dataset,
      validation
    },
    publishRecord
  };
};
