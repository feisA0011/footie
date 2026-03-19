# Footie

Footie is an autonomous football intelligence monorepo designed to support canonical historical/live data, validated intelligence layers, consumer product surfaces, and future partner APIs from one typed truth layer.

## Workspace Areas
- `apps/web`: mobile-first web shell
- `apps/mobile`: mobile app shell
- `services/api`: typed read API foundations
- `services/data-ingestion`: provider adapters, normalization, validation, and publish flows
- `services/orchestration`: worker graph and workflow control
- `packages/domain`: canonical football contracts and IDs
- `packages/ui`: shared UI primitives
- `docs/`: operating system, memory, plans, and review artifacts
- `.skills/`: reusable autonomous workflows

## Getting Started
1. `pnpm install`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm test`
5. `pnpm build`
