# Build Commands Memory

## Workspace
- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm run dev`
  Starts web/API dev servers and builds workspace dependencies first.

## Targeted
- `pnpm --filter @footie/domain test`
- `pnpm --filter @footie/data-ingestion test`
- `pnpm --filter @footie/api dev`
- `pnpm --filter @footie/db build`
- `node packages/db/dist/migrate.js`
- `node packages/db/dist/seed.js`

## Dependency-light fallback
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
