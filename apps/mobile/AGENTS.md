# AGENTS.md - apps/mobile

## Mission
Build the mobile-native Footie shell optimized for quick search, stats readability, alerts, and future scouting/editorial experiences.

## Build Order
1. Core navigation shell.
2. Search and entity summary surfaces.
3. Match/live modules.
4. Comparison and saved intelligence workflows.

## Autonomy Rules
- Prioritize touch ergonomics and offline-tolerant patterns.

## Coding Rules
- Share contracts/UI tokens with the workspace where practical.

## Testing Rules
- Add screen and state tests for navigation/search flows.

## Data Contract Rules
- Depend on canonical API contracts only.

## Schema / Migration Rules
- Mobile code must not encode persistence assumptions.

## Logging Rules
- Emit structured app events for critical interactions.

## PR Rules
- Document device/testing assumptions.

## Memory Maintenance Rules
- Capture durable mobile UX decisions in memory docs.

## Publish Gate Rules
- Only surface validated/published intelligence in production paths.
