import { Provider } from '@nestjs/common';
import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { MetricName, MetricLabel } from '../contracts/metrics.contracts';

const SYNC_LATENCY_BUCKETS = [0.5, 1, 2.5, 5, 10, 30, 60, 120];

export const BusinessMetricsProviders: Provider[] = [
  makeCounterProvider({
    name: MetricName.USER_REGISTRATIONS_TOTAL,
    help: 'Total number of new user registrations',
    labelNames: [MetricLabel.REGISTRATION_SOURCE, MetricLabel.STATUS],
  }),

  makeCounterProvider({
    name: MetricName.DOSES_SYNCED_TOTAL,
    help: 'Total number of doses created/synced from the hospital API',
    labelNames: [MetricLabel.SYNC_TYPE, MetricLabel.STATUS],
  }),

  makeCounterProvider({
    name: MetricName.DOSES_DELETED_TOTAL,
    help: 'Total number of obsolete doses deleted during a sync',
    labelNames: [MetricLabel.SYNC_TYPE, MetricLabel.STATUS],
  }),

  makeCounterProvider({
    name: MetricName.NOTIFICATIONS_SCHEDULED_TOTAL,
    help: 'Total number of notifications scheduled after a sync',
    labelNames: [MetricLabel.SYNC_TYPE, MetricLabel.STATUS],
  }),

  makeCounterProvider({
    name: MetricName.AUTH_LOGIN_ATTEMPTS_TOTAL,
    help: 'Total login attempts by method',
    labelNames: [MetricLabel.LOGIN_METHOD, MetricLabel.STATUS],
  }),

  makeCounterProvider({
    name: MetricName.AUTH_REGISTRATIONS_TOTAL,
    help: 'Total user registrations by method',
    labelNames: [MetricLabel.LOGIN_METHOD, MetricLabel.STATUS],
  }),

  makeCounterProvider({
    name: MetricName.AUTH_OTP_SENT_TOTAL,
    help: 'Total OTP sent by channel',
    labelNames: [MetricLabel.OTP_CHANNEL, MetricLabel.STATUS],
  }),

  makeHistogramProvider({
    name: MetricName.SYNC_DURATION_SECONDS,
    help: 'Duration of sync process in seconds',
    labelNames: [MetricLabel.SYNC_TYPE, MetricLabel.STATUS],
    buckets: SYNC_LATENCY_BUCKETS,
  }),
];
