# AGENTS.md - services/orchestration

## Mission
Coordinate narrow Footie workers, schedules, retries, replay, and dependency-aware execution across the data platform.

## Build Order
1. Worker registry and dependency graph.
2. Schedule windows and triggers.
3. Retry/idempotency controls.
4. Monitoring/replay hooks.

## Autonomy Rules
- Orchestrator coordinates; it does not absorb worker logic.

## Coding Rules
- Keep workflows explicit, typed, and inspectable.

## Testing Rules
- Add graph/order tests for worker plans and replay paths.

## Data Contract Rules
- Pass typed job payloads and result envelopes only.

## Schema / Migration Rules
- Changes to orchestration state need durability and replay notes.

## Logging Rules
- Log workflow IDs, run states, retries, and worker outcomes.

## PR Rules
- Summarize operational impact for any orchestration change.

## Memory Maintenance Rules
- Record durable execution policies and schedules.

## Publish Gate Rules
- Publishing worker steps must depend on completed validation steps.
