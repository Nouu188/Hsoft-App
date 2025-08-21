export const RoutingKey = {
  // User Events
  USER_FIRST_LOGIN: 'user.first_login',
  USER_PROFILE_UPDATED: 'user.profile_updated',

  // Sync Events
  SYNC_REQUEST: 'sync.request',

  // Batch Sync Events
  BATCH_START_FULL_SYNC: 'batch.start_full_sync',
  BATCH_PROCESS_SYNC: 'batch.process_sync',
  
  // Notification Events
  NOTIFICATION_SCHEDULE: 'notification.schedule', 

  // Appointment Events
  APPOINTMENT_CANCELLED: 'appointment.cancelled',
  APPOINTMENT_BOOKED: 'appointment.booked',
};