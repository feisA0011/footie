# AGENTS.md - apps/web

## Mission
Build the mobile-first web product shell for search, entity exploration, comparison, and narrative intelligence on top of canonical Footie APIs.

## Build Order
1. Shell/navigation/search primitives.
2. Typed data hooks and route contracts.
3. Entity pages for player/team/match/season.
4. Comparison/trend surfaces.
5. Narrative/editorial layers.

## Autonomy Rules
- Preserve mobile-first performance and readability.
- Do not bypass shared UI/domain contracts.

## Coding Rules
- Prefer server-safe typed contracts and reusable UI primitives.
- Keep visual components composable and accessible.

## Testing Rules
- Add component and route-level tests for new product flows.

## Data Contract Rules
- Consume only typed API/domain contracts.
- Never import provider-specific types.

## Schema / Migration Rules
- Web code cannot depend directly on database schema details.

## Logging Rules
- Use structured client/server telemetry events for critical search/navigation flows.

## PR Rules
- Include screenshots for perceptible UI changes when tooling is available.

## Memory Maintenance Rules
- Record durable UX decisions in product memory files.

## Publish Gate Rules
- No UI feature should assume unpublished or unvalidated data.
