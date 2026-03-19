# Build Commands Memory

## Workspace
- `pnpm install`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

## Targeted
- `pnpm --filter @footie/domain test`
- `pnpm --filter @footie/data-ingestion test`
- `pnpm --filter @footie/api dev`

## Dependency-light fallback
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
