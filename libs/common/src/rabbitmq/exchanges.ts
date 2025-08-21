import { RabbitMQExchangeConfig } from '@golevelup/nestjs-rabbitmq';

export const ExchangeName = {
  NOTIFICATION: 'notification.exchange',
  SYNC: 'sync.exchange',
  BATCH_SYNC: 'batch.sync.exchange',
  USER_EVENTS: 'user.events.exchange', 
  APPOINTMENT_EVENTS: 'appointment.events.exchange'
};

export const Exchanges: RabbitMQExchangeConfig[] = [
  {
    name: ExchangeName.NOTIFICATION,
    type: 'x-delayed-message',
    options: {
      durable: true,
      arguments: { 'x-delayed-type': 'topic' },
    },
  },
  {
    name: ExchangeName.SYNC,
    type: 'direct',
    options: { durable: true },
  },
  {
    name: ExchangeName.BATCH_SYNC,
    type: 'x-delayed-message',
    options: {
      durable: true,
      arguments: { 'x-delayed-type': 'direct' },
    },
  },
  {
    name: ExchangeName.USER_EVENTS,
    type: 'direct',
    options: { durable: true },
  },
  {
    name: ExchangeName.APPOINTMENT_EVENTS,
    type: 'direct',
    options: { durable: true },
  },
];