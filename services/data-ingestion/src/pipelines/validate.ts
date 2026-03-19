import type { ValidationIssue } from '@footie/domain';

import type { NormalizationResult, ValidationSummary } from '../core/types.js';

export const validateNormalizedBatch = (
  result: NormalizationResult
): ValidationSummary => {
  const issues: ValidationIssue[] = [];

  for (const match of result.dataset.matches) {
    if (match.homeTeamId === match.awayTeamId) {
      issues.push({
        code: 'MATCH_DUPLICATE_TEAM',
        severity: 'error',
        entityId: match.id,
        message: 'Home and away team cannot be the same canonical team.'
      });
    }

    if (Number.isNaN(Date.parse(match.kickoffAt))) {
      issues.push({
        code: 'MATCH_INVALID_KICKOFF',
        severity: 'error',
        entityId: match.id,
        message: 'Kickoff time must be a valid ISO timestamp.'
      });
    }
  }

  return {
    batchId: result.batchId,
    issues,
    valid: issues.every((issue) => issue.severity !== 'error'),
    matchCount: result.dataset.matches.length
  };
};
