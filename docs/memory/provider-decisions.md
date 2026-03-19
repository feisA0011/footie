# Provider Decisions Memory

## Current Decision
No production data provider is locked in for this milestone.

## Durable Rule
All providers must implement adapter interfaces for:
- competition/team/player/match fetches
- fixture windows and live updates
- raw payload envelope creation
- provider mapping and source metadata emission

## Development Default
Use clearly marked fixture adapters for local development and contract testing only.
