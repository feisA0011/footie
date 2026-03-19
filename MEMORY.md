# MEMORY

Footie is a pnpm/turbo TypeScript monorepo organized around a canonical football truth layer, narrow workers, and durable autonomous repo operations.

## Durable Facts
- Stack: TypeScript, pnpm workspaces, Turbo, Biome, Vitest, Fastify, Next.js web shell, Expo mobile shell.
- Canonical layers: raw ingestion -> normalization -> validation -> publish -> API/product surfaces.
- Core workers: orchestrator, fixture/schedule, ingestion, entity-resolution, normalization, validation, enrichment, publishing, monitoring, narrative.
- Public contracts must never leak provider-specific payloads.

## Index
- Architecture: `docs/memory/architecture.md`
- Domain model: `docs/memory/domain-model.md`
- Provider decisions: `docs/memory/provider-decisions.md`
- Build commands: `docs/memory/build-commands.md`
- Progress log: `docs/memory/progress.md`
- Open issues: `docs/memory/open-issues.md`
- Product principles: `docs/memory/product-principles.md`
- Orchestration: `docs/memory/orchestration.md`
- Data quality: `docs/memory/data-quality.md`
