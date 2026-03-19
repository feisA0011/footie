import { spawnSync } from 'node:child_process';

const emit = process.argv.includes('--emit');
const projects = [
  'packages/domain/tsconfig.json',
  'packages/ui/tsconfig.json',
  'services/data-ingestion/tsconfig.json',
  'services/orchestration/tsconfig.json',
  'services/api/tsconfig.json',
  'apps/web/tsconfig.json',
  'apps/mobile/tsconfig.json'
];

for (const project of projects) {
  const result = spawnSync('tsc', ['-p', project, ...(emit ? [] : ['--noEmit'])], {
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
