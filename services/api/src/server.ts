import { getCapabilitiesResponse } from './routes/capabilities.js';

export const getHealthResponse = () => ({ service: 'footie-api', status: 'ok' as const });

export const buildApiSnapshot = () => ({
  health: getHealthResponse(),
  capabilities: getCapabilitiesResponse()
});
