# Progress Memory

## 2026-03-19
- Audited repository: effectively empty repo on branch `work` with only `.gitkeep` and initial commit.
- Chose a TypeScript monorepo with pnpm/Turbo, Fastify services, Next.js web shell, and Expo mobile shell.
- Created autonomous repo operating system: root/nested AGENTS docs, memory system, skills, architecture docs, milestone plan, PR draft path, and review notes scaffold.
- Scaffolded first milestone packages/apps/services with canonical domain contracts, ingestion pipeline foundations, orchestration worker graph, API capabilities route, and UI primitives.
- Added dependency-light workspace validation scripts so lint/typecheck/build checks can run before registry access is fixed.
- Attempted `pnpm install`, but npm registry access returned 403 for `@types/node`; documented as an environment blocker.

## 2026-04-04
- Fixed dev bootstrap drift where `services/api` created an empty package-local SQLite file instead of using the repo-root database.
- Added non-production API database bootstrap so schema and sample data are created automatically before repositories open.
- Hardened the web homepage against invalid `/api/matches` and `/api/search` payloads so client state does not crash on backend failures.
- Updated Turbo dev to build workspace dependencies before launching persistent tasks.
