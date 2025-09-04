import { RabbitMQExchangeConfig } from '@golevelup/nestjs-rabbitmq';

export const ExchangeName = {
  NOTIFICATION: 'notification.exchange',

  DOSES_EVENTS: 'doses.events.exchange',
  DOSES_EVENTS_DELAY: 'doses.events.delay.exchange',

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
    name: ExchangeName.DOSES_EVENTS,
    type: 'direct',
    options: { durable: true },
  },
  {
    name: ExchangeName.DOSES_EVENTS_DELAY, 
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