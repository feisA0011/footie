# Domain Model Memory

## Canonical Entities
- Competition
- Season
- Team
- Player
- Match
- MatchParticipation / lineups
- TeamSeasonSnapshot
- PlayerSeasonSnapshot
- ProviderMapping
- ValidationIssue
- PublishRecord

## Identifier Strategy
Canonical IDs use stable prefixes by entity type (`cmp`, `ssn`, `tem`, `ply`, `mtc`) and normalized slugs/hashes so provider mappings can fan in without changing public references.

## Contract Rules
- Distinguish canonical truth entities from adapter payload envelopes.
- Preserve source provenance and confidence alongside normalized facts.
- Support historical and live states within a unified match lifecycle model.
