import { describe, expect, it } from 'vitest';

import { workerGraph } from './index.js';

describe('worker graph', () => {
  it('ensures publishing depends on validation', () => {
    const publishing = workerGraph.find((worker) => worker.name === 'publishing');
    expect(publishing?.dependsOn).toContain('validation');
  });
});
