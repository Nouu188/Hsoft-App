import { CommonMetricsProviders } from './common-metrics.providers';
import { BusinessMetricsProviders } from './business-metrics.providers';

export const AllMetricsProviders = [
  ...CommonMetricsProviders,
  ...BusinessMetricsProviders,
];
