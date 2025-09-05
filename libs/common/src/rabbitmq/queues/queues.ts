export const QueueName = {
  // === SAGA ORCHESTRATOR QUEUES ===
  ORCHESTRATOR_SAGA_INITIATOR: 'orchestrator.saga-initiator.queue',
  ORCHESTRATOR_IDENTITY_REPLY: 'orchestrator.identity-reply.queue',
  // (Tương lai) ORCHESTRATOR_SCHEDULING_REPLY: 'orchestrator.scheduling-reply.queue',

  // === COMMAND HANDLER QUEUES ===
  IDENTITY_CREATE_COMMAND: 'identity.create-command.queue',
  // (Tương lai) SCHEDULING_SYNC_INFO_COMMAND: 'scheduling.sync-info-command.queue',
  SCHEDULING_SYNC_DOSE_HISTORY_COMMAND: 'scheduling.sync.doses_history.command',

  // === Các queues hiện có ===
  SCHEDULING_DOSES_SYNC_REQUESTS: 'scheduling.doses.sync.requests.queue',
  SCHEDULING_DOSES_BATCH_CREATION: 'scheduling.doses.batch.creation.queue',
  SCHEDULING_DOSES_BATCH_SYNC: 'scheduling.doses.batch.sync.queue',
  APPOINTMENT_BOOKED: 'appointments.booked.queue',
  NOTIFICATION_SCHEDULER: 'notification.scheduler.queue',
};
