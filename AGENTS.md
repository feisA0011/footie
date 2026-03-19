# AGENTS.md

## Mission
Build Footie as an autonomous football intelligence company monorepo with a canonical truth layer, durable operating docs, and production-grade typed boundaries.

## Build Order
1. Repository operating system: instructions, memory, skills, plans, progress, review artifacts.
2. Shared tooling and typed workspace contracts.
3. Canonical domain model, schema governance, and migration policy.
4. Ingestion/orchestration/validation/publish foundations.
5. API/search/product surfaces.
6. Narrative, admin, and partner expansion layers.

## Autonomy Rules
- Act without waiting for routine confirmation.
- Prefer repo-local solutions over external dependencies when reasonable.
- Record durable decisions in `MEMORY.md` and linked topic files.
- When blocked, document the blocker in `docs/memory/open-issues.md` and continue adjacent work.
- Never work directly on `main`; use the current task branch or create one.

## Coding Rules
- Prefer TypeScript across apps, services, and packages unless a strong reason is documented.
- Keep provider-specific payloads behind adapter boundaries.
- Favor explicit types, pure transforms, and deterministic workflows.
- Avoid placeholder code that hides missing behavior; mark non-production fixtures clearly.

## Testing Rules
- Add or update automated tests with each domain or pipeline change.
- Run the narrowest meaningful checks first, then broader workspace checks.
- Document any environment limitations in progress logs and PR notes.

## Data Contract Rules
- Public contracts must depend on canonical Footie entities only.
- Raw source payloads stay in ingestion/staging layers.
- Schema changes require updated docs, tests, and migration notes.

## Schema / Migration Rules
- Treat canonical IDs and relationship tables as stable interfaces.
- Forward-only migration strategy; document rollback/repair guidance.
- No destructive schema action without explicit justification in docs.

## Logging Rules
- Use structured logs with event names, actor/service, entity identifiers, and correlation IDs.
- Log validation failures and publish decisions as first-class events.

## PR Rules
- Ship coherent milestone commits.
- Maintain `docs/pr/` drafts when direct remote PR creation is unavailable.
- Include summary, risks, validation, and next steps in PR materials.

## Memory Maintenance Rules
- Keep `MEMORY.md` concise.
- Store detailed durable knowledge under `docs/memory/`.
- Update progress and open issues whenever plans or blockers change.

## Publish Gate Rules
- No publish path may bypass validation/audit records.
- Confidence/uncertainty markers must be preserved through promotion.
