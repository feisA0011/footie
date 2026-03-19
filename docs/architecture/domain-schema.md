# Canonical Domain and Schema Strategy

## Canonical Truth Tables (planned)
- competitions
- seasons
- teams
- players
- matches
- team_match_facts
- player_match_facts
- provider_mappings
- validation_issues
- publish_records

## Separation of Concerns
- Raw payloads live in append-only staging storage.
- Canonical truth tables hold normalized entities and facts.
- Mapping tables bridge provider identities to canonical IDs.
- Publish records describe promotions between stages and downstream consumers.

## Migration Policy
- Forward-only migrations.
- Every schema change updates docs, contracts, and validation coverage.
- Data repair plans must accompany any backfill-sensitive change.
