# Data Quality Memory

## Principles
- Deterministic transforms over opaque heuristics where practical.
- Every normalized record carries provenance, timestamps, and confidence.
- Validation issues are durable artifacts, not ephemeral logs.
- Publish decisions require validation summaries and replay references.

## Initial Checks
- Referential integrity between matches, teams, seasons, and competitions.
- Match kickoff chronology and score sanity.
- Season coverage windows by competition.
- Provider mapping uniqueness by provider/entity/source identifier.
