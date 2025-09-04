import { QueueName } from './queues';
import { DeadLetterExchangeName } from '../exchanges';
import { DeadLetterRoutingKey } from '../routing-keys';
import { DeadLetterQueueName } from './dl-queue';

export const Queues = [
  // === USER EVENTS ===
  {
    name: QueueName.IDENTITY_USER_FIRST_LOGIN,
    options: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': DeadLetterExchangeName.USER_EVENTS_DL,
        'x-dead-letter-routing-key': DeadLetterRoutingKey.USER_FIRST_LOGIN_IDENTITY_FAILED,
      },
    },
  },
  { name: DeadLetterQueueName.IDENTITY_USER_FIRST_LOGIN_DLQ, options: { durable: true } },

  {
    name: QueueName.SCHEDULING_USER_FIRST_LOGIN,
    options: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': DeadLetterExchangeName.USER_EVENTS_DL,
        'x-dead-letter-routing-key': DeadLetterRoutingKey.USER_FIRST_LOGIN_SCHEDULING_FAILED,
      },
    },
  },
  { name: DeadLetterQueueName.SCHEDULING_USER_FIRST_LOGIN_DLQ, options: { durable: true } },

  // === DOSES EVENTS ===
  {
    name: QueueName.SCHEDULING_DOSES_SYNC_REQUESTS,
    options: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': DeadLetterExchangeName.DOSES_EVENTS_DL,
        'x-dead-letter-routing-key': DeadLetterRoutingKey.DOSES_SYNC_REQUESTED_FAILED,
      },
    },
  },
  { name: DeadLetterQueueName.SCHEDULING_DOSES_SYNC_REQUESTS_DLQ, options: { durable: true } },

  {
    name: QueueName.SCHEDULING_DOSES_BATCH_CREATION,
    options: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': DeadLetterExchangeName.DOSES_EVENTS_DL,
        'x-dead-letter-routing-key': DeadLetterRoutingKey.DOSES_BATCH_SYNC_STARTED_FAILED,
      },
    },
  },
  { name: DeadLetterQueueName.SCHEDULING_DOSES_BATCH_CREATION_DLQ, options: { durable: true } },

  {
    name: QueueName.SCHEDULING_DOSES_BATCH_SYNC,
    options: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': DeadLetterExchangeName.DOSES_EVENTS_DL,
        'x-dead-letter-routing-key': DeadLetterRoutingKey.DOSES_BATCH_SYNC_PROCESSED_FAILED,
      },
    },
  },
  { name: DeadLetterQueueName.SCHEDULING_DOSES_BATCH_SYNC_DLQ, options: { durable: true } },

  // === NOTIFICATION ===
  {
    name: QueueName.NOTIFICATION_SCHEDULER,
    options: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': DeadLetterExchangeName.NOTIFICATION_DL,
        'x-dead-letter-routing-key': DeadLetterRoutingKey.NOTIFICATION_SCHEDULED_FAILED,
      },
    },
  },
  { name: DeadLetterQueueName.NOTIFICATION_SCHEDULER_DLQ, options: { durable: true } },

  // === APPOINTMENT ===
  {
    name: QueueName.APPOINTMENT_BOOKED,
    options: {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': DeadLetterExchangeName.APPOINTMENT_EVENTS_DL,
        'x-dead-letter-routing-key': DeadLetterRoutingKey.APPOINTMENT_BOOKED_FAILED,
      },
    },
  },
  { name: DeadLetterQueueName.APPOINTMENT_BOOKED_DLQ, options: { durable: true } },
];
