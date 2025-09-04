import { RabbitMQExchangeConfig } from "@golevelup/nestjs-rabbitmq";

export const DeadLetterExchangeName = {
  NOTIFICATION_DL: 'notification.dlx',

  DOSES_EVENTS_DL: 'doses.events.dlx',
  
  USER_EVENTS_DL: 'user.events.dlx',
  
  APPOINTMENT_EVENTS_DL: 'appointment.events.dlx',
};

export const DeadLetterExchanges: RabbitMQExchangeConfig[] = [
  {
    name: DeadLetterExchangeName.NOTIFICATION_DL,
    type: 'direct',
    options: { durable: true },
  },
  {
    name: DeadLetterExchangeName.DOSES_EVENTS_DL,
    type: 'direct',
    options: { durable: true },
  },
  {
    name: DeadLetterExchangeName.USER_EVENTS_DL,
    type: 'direct',
    options: { durable: true },
  },
  {
    name: DeadLetterExchangeName.APPOINTMENT_EVENTS_DL,
    type: 'direct',
    options: { durable: true },
  },
];