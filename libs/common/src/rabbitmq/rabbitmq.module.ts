import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const NOTIFICATION_EXCHANGE = 'notification.exchange';
export const SYNC_EXCHANGE = 'sync.exchange';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
useFactory: (configService: ConfigService) => {
  const uri = configService.get<string>('RABBITMQ_URI')!;
  const logger = new Logger('RabbitMQConfig');

  logger.debug(`Connecting to RabbitMQ at URI: ${uri}`);

  return {
    exchanges: [
      {
        name: NOTIFICATION_EXCHANGE,
        type: 'x-delayed-message',
        options: {
          durable: true,
          arguments: {
            'x-delayed-type': 'topic',
          },
        },
      },
      {
        name: SYNC_EXCHANGE,
        type: 'direct',
      },
    ],
    uri,
    connectionInitOptions: { wait: false },
    enableControllerDiscovery: true,
  };
}
    }),
  ],
  exports: [RabbitMQModule],
})
export class AppRabbitMQModule {}