import { Provider } from '@nestjs/common';
import { makeCounterProvider, makeHistogramProvider } from '@willsoto/nestjs-prometheus';
import { MetricName, MetricLabel } from '../contracts/metrics.contracts';

const COMMON_LATENCY_BUCKETS = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10];

export const CommonMetricsProviders: Provider[] = [
  makeHistogramProvider({
    name: MetricName.HTTP_REQUESTS_DURATION_SECONDS,
    help: 'Duration of HTTP requests in seconds',
    labelNames: [MetricLabel.METHOD, MetricLabel.ROUTE, MetricLabel.STATUS_CODE],
    buckets: COMMON_LATENCY_BUCKETS,
  }),

  makeHistogramProvider({
    name: MetricName.GRAPHQL_REQUESTS_DURATION_SECONDS,
    help: 'Duration of GraphQL requests in seconds',
    labelNames: [MetricLabel.OPERATION_NAME, MetricLabel.OPERATION_TYPE, MetricLabel.STATUS],
    buckets: COMMON_LATENCY_BUCKETS,
  }),

  makeCounterProvider({
    name: MetricName.RABBITMQ_MESSAGES_PROCESSED_TOTAL,
    help: 'Total number of RabbitMQ messages processed',
    labelNames: [MetricLabel.EXCHANGE, MetricLabel.ROUTING_KEY, MetricLabel.STATUS],
  }),

  makeHistogramProvider({
    name: MetricName.DB_QUERY_DURATION_SECONDS,
    help: 'Duration of database queries in seconds',
    labelNames: [MetricLabel.QUERY_TYPE, MetricLabel.TABLE_NAME],
    buckets: COMMON_LATENCY_BUCKETS,
  }),
];
