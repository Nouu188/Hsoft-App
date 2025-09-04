export const DeadLetterRoutingKey = {
  // User Events
  USER_FIRST_LOGIN_SCHEDULING_FAILED: 'user.first-login.scheduling.failed',
  USER_FIRST_LOGIN_IDENTITY_FAILED: 'user.first-login.identity.failed',
  USER_PROFILE_UPDATED_FAILED: 'user.profile.updated.failed',

  // Doses Sync Events
  DOSES_SYNC_REQUESTED_FAILED: 'doses.sync.requested.failed',

  // Doses Batch Sync Events
  DOSES_BATCH_SYNC_STARTED_FAILED: 'doses.batch-sync.started.failed',
  DOSES_BATCH_SYNC_PROCESSED_FAILED: 'doses.batch-sync.processed.failed',

  // Notification Events
  NOTIFICATION_SCHEDULED_FAILED: 'notification.scheduled.failed',

  // Appointment Events
  APPOINTMENT_CANCELLED_FAILED: 'appointment.cancelled.failed',
  APPOINTMENT_BOOKED_FAILED: 'appointment.booked.failed',
};
