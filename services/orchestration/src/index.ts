export interface WorkerDefinition {
  readonly name:
    | 'orchestrator'
    | 'fixture-schedule'
    | 'ingestion'
    | 'entity-resolution'
    | 'normalization'
    | 'validation'
    | 'enrichment'
    | 'publishing'
    | 'monitoring'
    | 'narrative';
  readonly dependsOn: readonly WorkerDefinition['name'][];
  readonly purpose: string;
}

export const workerGraph: readonly WorkerDefinition[] = [
  {
    name: 'orchestrator',
    dependsOn: [],
    purpose: 'Coordinates workflows, windows, replay, and retries.'
  },
  {
    name: 'fixture-schedule',
    dependsOn: ['orchestrator'],
    purpose: 'Determines fixture windows and live update priorities.'
  },
  {
    name: 'ingestion',
    dependsOn: ['fixture-schedule'],
    purpose: 'Fetches raw provider payloads into staging.'
  },
  {
    name: 'entity-resolution',
    dependsOn: ['ingestion'],
    purpose: 'Maps provider identities onto canonical IDs.'
  },
  {
    name: 'normalization',
    dependsOn: ['entity-resolution'],
    purpose: 'Transforms staged payloads into canonical candidates.'
  },
  {
    name: 'validation',
    dependsOn: ['normalization'],
    purpose: 'Runs audit and rule packs on canonical candidates.'
  },
  {
    name: 'enrichment',
    dependsOn: ['validation'],
    purpose: 'Calculates derived metrics and intelligence features.'
  },
  {
    name: 'publishing',
    dependsOn: ['validation', 'enrichment'],
    purpose: 'Promotes validated truth into published stores.'
  },
  {
    name: 'monitoring',
    dependsOn: ['publishing'],
    purpose: 'Tracks freshness, pipeline health, and quality budgets.'
  },
  {
    name: 'narrative',
    dependsOn: ['publishing'],
    purpose: 'Generates explainable narratives from published truth.'
  }
];
