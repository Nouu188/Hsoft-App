/**
 * =============================================================================
 *                               METRIC NAMES
 * =============================================================================
 * Định nghĩa tên của tất cả các custom metrics trong hệ thống.
 * Quy tắc đặt tên: <subsystem>_<item>_<unit>
 */
export const MetricName = {
  // --- HTTP Metrics ---
  HTTP_REQUESTS_DURATION_SECONDS: 'http_requests_duration_seconds',

  // --- GraphQL Metrics ---
  GRAPHQL_REQUESTS_DURATION_SECONDS: 'graphql_requests_duration_seconds',

  // --- RabbitMQ Metrics ---
  RABBITMQ_MESSAGES_PROCESSED_TOTAL: 'rabbitmq_messages_processed_total',

  // --- Database Metrics ---
  DB_QUERY_DURATION_SECONDS : 'db_query_duration_seconds',

  // --- Business Metrics (Ví dụ mở rộng) ---
  USER_REGISTRATIONS_TOTAL: 'user_registrations_total',

  // --- Doses Sync Metrics ---
  DOSES_SYNCED_TOTAL: 'doses_synced_total',

  // --- Doses Metrics ---
  DOSES_DELETED_TOTAL: 'doses_deleted_total',

  // --- Notification Metrics ---
  NOTIFICATIONS_SCHEDULED_TOTAL: 'notifications_scheduled_total',
};


export const MetricLabel = {
  // --- General Labels ---
  STATUS: 'status', // e.g., 'success', 'error', 'acked', 'nacked'

  // --- HTTP Labels ---
  METHOD: 'method',
  ROUTE: 'route',
  STATUS_CODE: 'status_code',

  // --- GraphQL Labels ---
  OPERATION_NAME: 'operation_name',
  OPERATION_TYPE: 'operation_type',

  // --- RabbitMQ Labels ---
  EXCHANGE: 'exchange',
  ROUTING_KEY: 'routing_key',

  // --- Database Labels ---
  QUERY_TYPE: 'query_type',
  TABLE_NAME: 'table_name', // e.g, 

  // --- Business Labels ---
  REGISTRATION_SOURCE: 'source', // e.g., 'app', 'hospital_sync'

  // --- Doses Sync Labels ---
  SYNC_TYPE: 'sync_type', // e.g., 'future', 'full'
};