# Open Issues Memory

## Active Blockers / Follow-ups
1. No git remote is configured, so branch push and remote PR creation are unavailable in this environment.
2. Production provider selection remains intentionally deferred; adapter boundary exists, but live integrations are not yet implemented.
3. Search/index persistence and database migrations are documented but not yet wired to a concrete database in this milestone.
4. `pnpm install` is currently blocked by a 403 response from the npm registry for `@types/node`, so dependency-backed tooling cannot yet be installed.
