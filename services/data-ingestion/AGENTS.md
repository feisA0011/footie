# AGENTS.md - services/data-ingestion

## Mission
Ingest provider data into raw staging, normalize it into canonical truth candidates, validate quality, and prepare publish decisions.

## Build Order
1. Provider adapter interfaces.
2. Raw envelope staging.
3. Normalization pipeline.
4. Validation/audit pipeline.
5. Publish/promote workflow.

## Autonomy Rules
- Preserve replayability and provenance.
- Keep adapters narrow and provider-specific logic isolated.

## Coding Rules
- Prefer pure transforms and explicit pipeline states.
- Make idempotency strategy visible in code.

## Testing Rules
- Add fixture-based tests for adapters, normalization, and validation rules.

## Data Contract Rules
- Raw payloads stay internal; outputs are canonical candidates/issues/records.

## Schema / Migration Rules
- Staging and canonical schema updates need migration and replay notes.

## Logging Rules
- Log ingestion batch IDs, provider windows, and validation summaries.

## PR Rules
- Include pipeline diagrams or notes when changing stage transitions.

## Memory Maintenance Rules
- Capture provider quirks and durable normalization decisions.

## Publish Gate Rules
- No candidate is publishable until validation passes defined thresholds.
