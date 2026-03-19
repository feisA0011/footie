export const capabilities = {
  domain: ['competitions', 'seasons', 'teams', 'players', 'matches'],
  workers: [
    'orchestrator',
    'fixture-schedule',
    'ingestion',
    'entity-resolution',
    'normalization',
    'validation',
    'enrichment',
    'publishing',
    'monitoring',
    'narrative'
  ],
  surfaces: ['web', 'mobile', 'partner-api', 'widgets', 'editorial']
} as const;

export const getCapabilitiesResponse = () => ({
  service: 'footie-api',
  status: 'ok',
  capabilities
});
