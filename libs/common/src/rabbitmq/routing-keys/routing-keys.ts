export const RoutingKey = {
  // 1. Event khởi tạo Saga từ Account Service
  USER_FIRST_LOGIN_SAGA_INITIATED: 'user.saga.initiated',
  
  // 2. Command từ Orchestrator đến Identity Service
  CREATE_IDENTITY_COMMAND: 'identity.command.create',

  // 3. Reply Events từ Identity Service về Orchestrator
  IDENTITY_CREATED_SUCCESS: 'identity.created.success',
  IDENTITY_CREATED_FAILURE: 'identity.created.failure',

  // (Tương lai) Các command và event khác của saga
  // SYNC_SCHEDULING_INFO_COMMAND: 'scheduling.command.sync',
  SCHEDULING_INFO_SYNCED_SUCCESS: 'scheduling.synced.success',
  SCHEDULING_INFO_SYNCED_FAILURE: 'scheduling.synced.failure',

  SYNC_DOSE_HISTORY_COMMAND: 'sync.doses_history.command',
  DOSE_HISTORY_SYNCED_SUCCESS: 'dose-history.synced.success',
  DOSE_HISTORY_SYNCED_FAILURE: 'dose-history.synced.failure',
  
  // === Các Events hiện có ===
  USER_PROFILE_UPDATED: 'user.profile.updated',
  DOSES_SYNC_REQUESTED: 'doses.sync.requested',
  DOSES_BATCH_SYNC_STARTED: 'doses.batch-sync.started',
  DOSES_BATCH_SYNC_PROCESSED: 'doses.batch-sync.processed',
  NOTIFICATION_SCHEDULED: 'notification.scheduled',
  APPOINTMENT_CANCELLED: 'appointment.cancelled',
  APPOINTMENT_BOOKED: 'appointment.booked',
};
