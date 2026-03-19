# Footie Architecture Overview

## North Star
Footie is a football intelligence platform built around a canonical data truth layer that powers consumer experiences, editorial intelligence, and partner APIs from the same validated foundation.

## Monorepo Layout
- `apps/`: user-facing product shells.
- `services/`: runtime backends and workers.
- `packages/`: shared contracts, UI, config, and observability.
- `docs/`: architecture, plans, memory, PR drafts, and review notes.
- `.skills/`: reusable autonomous workflows.

## Layered Flow
1. Provider adapters fetch raw football data.
2. Raw envelopes are staged with provenance.
3. Deterministic normalization produces canonical entities/events.
4. Validation/audit gates score quality and identify issues.
5. Publish records promote facts to downstream APIs/search/product surfaces.
6. Narrative and intelligence layers operate on published truth plus confidence metadata.

## Why This Stack
- TypeScript enables one shared type system across apps, services, workers, and docs-generated contracts.
- pnpm/Turbo keeps the repo manageable as the company expands.
- Fastify offers performant backend foundations with low ceremony.
- Next.js + Expo preserve web/mobile symmetry while allowing differentiated surfaces later.
