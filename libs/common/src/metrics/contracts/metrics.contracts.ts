export enum MetricName {
  HTTP_REQUESTS_DURATION_SECONDS = 'http_requests_duration_seconds',
  GRAPHQL_REQUESTS_DURATION_SECONDS = 'graphql_requests_duration_seconds',
  RABBITMQ_MESSAGES_PROCESSED_TOTAL = 'rabbitmq_messages_processed_total',
  DB_QUERY_DURATION_SECONDS = 'db_query_duration_seconds',

  // Business
  USER_REGISTRATIONS_TOTAL = 'user_registrations_total',
  DOSES_SYNCED_TOTAL = 'doses_synced_total',
  DOSES_DELETED_TOTAL = 'doses_deleted_total',
  NOTIFICATIONS_SCHEDULED_TOTAL = 'notifications_scheduled_total',
  AUTH_LOGIN_ATTEMPTS_TOTAL = 'auth_login_attempts_total',
  AUTH_REGISTRATIONS_TOTAL = 'auth_registrations_total',
  AUTH_OTP_SENT_TOTAL = 'auth_otp_sent_total',
  SYNC_DURATION_SECONDS = 'sync_duration_seconds',
}

export enum MetricLabel {
  METHOD = 'method',
  ROUTE = 'route',
  STATUS_CODE = 'status_code',

  OPERATION_NAME = 'operation_name',
  OPERATION_TYPE = 'operation_type',
  STATUS = 'status',

  EXCHANGE = 'exchange',
  ROUTING_KEY = 'routing_key',

  QUERY_TYPE = 'query_type',
  TABLE_NAME = 'table_name',

  REGISTRATION_SOURCE = 'registration_source',

  SYNC_TYPE = 'sync_type',

  LOGIN_METHOD = 'login_method',

  OTP_CHANNEL = 'otp_channel',
}
