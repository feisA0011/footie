# Architecture Memory

## Chosen Stack
- Monorepo managed with pnpm workspaces and Turbo for task orchestration.
- TypeScript everywhere for shared contracts and autonomous maintainability.
- Fastify for API/service runtime due to low overhead and strong typing.
- Next.js web shell for mobile-first product surfaces and future server components.
- Expo mobile shell for native/mobile channel continuity.

## System Shape
- `packages/domain`: canonical football entities, IDs, contracts, and schema docs.
- `services/data-ingestion`: adapter interfaces, fixture ingestion, staging, normalization, validation, and publish orchestration.
- `services/orchestration`: worker plans, dependency graph, and control-plane flows.
- `services/api`: typed read APIs and health/capability routes.
- `packages/ui`: shared product shell primitives.
- `apps/web` and `apps/mobile`: search-first consumer surfaces.

## First Milestone Focus
Establish the autonomous repo operating system, shared workspace tooling, and canonical domain/data pipeline contracts before deeper product features.
