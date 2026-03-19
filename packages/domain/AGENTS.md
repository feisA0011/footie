# AGENTS.md - packages/domain

## Mission
Define the canonical football domain model, IDs, schemas, and public contracts that every Footie surface depends on.

## Build Order
1. Identifier strategy.
2. Core entities and lifecycle enums.
3. Validation/publish contracts.
4. Derived intelligence contracts.

## Autonomy Rules
- Optimize for long-term stability and explicit semantics.

## Coding Rules
- Keep domain types transport-agnostic and provider-agnostic.
- Prefer readonly structures and exact types.

## Testing Rules
- Add unit tests for ID helpers, invariants, and contract guards.

## Data Contract Rules
- Domain package is the canonical contract source.

## Schema / Migration Rules
- Any breaking semantic change requires migration notes and version strategy.

## Logging Rules
- Domain package defines event names/types but not runtime logger implementations.

## PR Rules
- Highlight any contract changes prominently.

## Memory Maintenance Rules
- Update domain-model memory for durable semantic decisions.

## Publish Gate Rules
- Published truth contracts must encode provenance and confidence.
