# AGENTS.md - packages/ui

## Mission
Provide shared mobile-first UI primitives and design tokens for Footie's product surfaces.

## Build Order
1. Tokens and layout primitives.
2. Search/entity cards.
3. Stats/comparison modules.
4. Narrative/editorial components.

## Autonomy Rules
- Build reusable primitives before bespoke page components.

## Coding Rules
- Keep components accessible, composable, and typed.

## Testing Rules
- Add component tests for behavior and visual states.

## Data Contract Rules
- UI components accept canonical view models, not provider payloads.

## Schema / Migration Rules
- UI code must not depend on persistence shape.

## Logging Rules
- Shared telemetry props/events should stay explicit.

## PR Rules
- Document breaking UI API changes and provide migration guidance.

## Memory Maintenance Rules
- Capture durable design-system decisions in memory docs.

## Publish Gate Rules
- Shared components should visually express uncertainty/confidence states when provided.
