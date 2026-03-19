import { describe, expect, it } from 'vitest';

import { renderSearchEntryCard } from './index.js';

describe('renderSearchEntryCard', () => {
  it('renders a compact string preview', () => {
    expect(
      renderSearchEntryCard({
        title: 'Arsenal',
        subtitle: 'Premier League',
        metricLabel: 'Points',
        metricValue: '61'
      })
    ).toContain('Points: 61');
  });
});
