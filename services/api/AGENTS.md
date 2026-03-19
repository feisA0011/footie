# AGENTS.md - services/api

## Mission
Expose typed, stable read APIs and partner-ready contracts backed by Footie's canonical published truth.

## Build Order
1. Health/capability routes.
2. Entity search/read routes.
3. Comparison/trend endpoints.
4. Partner/auth/rate-limit layers.

## Autonomy Rules
- Keep API boundaries canonical and versionable.
- Prefer backward-compatible evolution.

## Coding Rules
- Validate inputs/outputs explicitly.
- Keep transport concerns separate from domain services.

## Testing Rules
- Add route and contract tests for each endpoint.

## Data Contract Rules
- Public responses may not leak raw provider payloads.

## Schema / Migration Rules
- Database schema changes must remain hidden behind repositories/services.

## Logging Rules
- Log request outcomes with correlation IDs and entity scopes.

## PR Rules
- Document endpoint changes and compatibility notes.

## Memory Maintenance Rules
- Record durable API design decisions in memory docs.

## Publish Gate Rules
- Read APIs serve published truth only unless explicitly marked internal.
