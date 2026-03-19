import { renderSearchEntryCard } from '@footie/ui';

export const webHomePreview = () => ({
  hero: 'Search the football graph',
  previewCard: renderSearchEntryCard({
    title: 'Bukayo Saka',
    subtitle: 'Arsenal · 2025-26 form',
    metricLabel: 'xG+xA/90',
    metricValue: '0.78'
  })
});
