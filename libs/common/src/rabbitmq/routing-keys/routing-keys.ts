export const RoutingKey = {
  // User Events
  USER_FIRST_LOGIN_SCHEDULING: 'user.first-login.scheduling',
  USER_FIRST_LOGIN_IDENTITY: 'user.first-login.identity',
  USER_PROFILE_UPDATED: 'user.profile.updated',

  // Doses Sync Events
  DOSES_SYNC_REQUESTED: 'doses.sync.requested',

  // Doses Batch Sync Events
  DOSES_BATCH_SYNC_STARTED: 'doses.batch-sync.started',
  DOSES_BATCH_SYNC_PROCESSED: 'doses.batch-sync.processed',

  // Notification Events
  NOTIFICATION_SCHEDULED: 'notification.scheduled',

  // Appointment Events
  APPOINTMENT_CANCELLED: 'appointment.cancelled',
  APPOINTMENT_BOOKED: 'appointment.booked',
};
