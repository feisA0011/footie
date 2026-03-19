import { existsSync, readFileSync } from 'node:fs';

const requiredPaths = [
  'AGENTS.md',
  'MEMORY.md',
  'docs/architecture/overview.md',
  'docs/plans/milestones.md',
  'docs/pr/milestone-01.md',
  'apps/web/AGENTS.md',
  'apps/mobile/AGENTS.md',
  'services/api/AGENTS.md',
  'services/data-ingestion/AGENTS.md',
  'services/orchestration/AGENTS.md',
  'packages/domain/AGENTS.md',
  'packages/ui/AGENTS.md'
];

for (const path of requiredPaths) {
  if (!existsSync(path)) {
    console.error(`Missing required path: ${path}`);
    process.exit(1);
  }
}

const workerGraph = readFileSync('services/orchestration/src/index.ts', 'utf8');
if (!workerGraph.includes("name: 'publishing'") || !workerGraph.includes("dependsOn: ['validation', 'enrichment']")) {
  console.error('Worker graph is missing publishing dependency guarantees.');
  process.exit(1);
}

const domainContracts = readFileSync('packages/domain/src/entities.ts', 'utf8');
if (!domainContracts.includes('ProviderMapping') || !domainContracts.includes('PublishRecord')) {
  console.error('Domain contracts are missing provider or publish artifacts.');
  process.exit(1);
}

console.log('Repository validation checks passed.');
