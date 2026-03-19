export interface SearchEntryCardProps {
  readonly title: string;
  readonly subtitle: string;
  readonly metricLabel?: string;
  readonly metricValue?: string;
}

export const renderSearchEntryCard = ({
  title,
  subtitle,
  metricLabel,
  metricValue
}: SearchEntryCardProps): string => {
  const metric = metricLabel && metricValue ? `${metricLabel}: ${metricValue}` : 'No metric';
  return `${title} — ${subtitle} — ${metric}`;
};
