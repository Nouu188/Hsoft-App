import { Provider } from '@nestjs/common';
import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { MetricName, MetricLabel } from './metrics.contracts';

const COMMON_LATENCY_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

export const CommonMetricsProviders: Provider[] = [
  // 1. HTTP Request Duration
  makeHistogramProvider({
    name: MetricName.HTTP_REQUESTS_DURATION_SECONDS,
    help: 'Duration of HTTP requests in seconds',
    labelNames: [MetricLabel.METHOD, MetricLabel.ROUTE, MetricLabel.STATUS_CODE],
    buckets: COMMON_LATENCY_BUCKETS,
  }),

  // 2. GraphQL Request Duration
  makeHistogramProvider({
    name: MetricName.GRAPHQL_REQUESTS_DURATION_SECONDS,
    help: 'Duration of GraphQL requests in seconds',
    labelNames: [MetricLabel.OPERATION_NAME, MetricLabel.OPERATION_TYPE, MetricLabel.STATUS],
    buckets: COMMON_LATENCY_BUCKETS,
  }),

  // 3. RabbitMQ Message Processing
  makeCounterProvider({
    name: MetricName.RABBITMQ_MESSAGES_PROCESSED_TOTAL,
    help: 'Total number of RabbitMQ messages processed',
    labelNames: [MetricLabel.EXCHANGE, MetricLabel.ROUTING_KEY, MetricLabel.STATUS],
  }),

  // 4. Database Query Duration
  makeHistogramProvider({
    name: MetricName.DB_QUERY_DURATION_SECONDS,
    help: 'Duration of database queries in seconds',
    labelNames: [MetricLabel.QUERY_TYPE, MetricLabel.TABLE_NAME],
    buckets: COMMON_LATENCY_BUCKETS,
  }),

  // --- Ví dụ về Business Metrics ---
  // 5. User Registrations
  makeCounterProvider({
    name: MetricName.USER_REGISTRATIONS_TOTAL,
    help: 'Total number of new user registrations',
    labelNames: [MetricLabel.REGISTRATION_SOURCE, MetricLabel.STATUS],
  }),

  // 6. Doses Synced
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
];