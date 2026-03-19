# Skill: Ingestion Building

## Purpose
Build raw ingestion, staging, idempotent processing, and replay-aware worker flows.

## When to Use It
Use this skill when work in its domain is part of the current milestone or when a change risks long-term architecture drift.

## Detailed Instructions
1. Review the root `AGENTS.md` and the nearest scoped `AGENTS.md` files.
2. Check `MEMORY.md` and relevant topic memory files for durable decisions.
3. Identify the canonical contracts, boundaries, and quality gates affected.
4. Implement the smallest coherent change that preserves long-term architecture.
5. Update docs, memory, and progress artifacts for durable decisions or blockers.

## Expected Outputs
- Code and/or docs aligned to the skill domain.
- Updated tests/checks or explicit follow-up notes.
- Memory/progress updates for durable changes.

## Quality Checks
- Contracts remain typed and provider-agnostic where required.
- Relevant lint/type/test checks are run or blockers documented.
- Review notes mention risks and next steps when incomplete.

## Failure Behavior
If blocked, record the blocker in `docs/memory/open-issues.md`, update progress docs, and proceed with adjacent preparatory work.
