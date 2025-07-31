import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const NOTIFICATION_EXCHANGE = 'notification.exchange';
export const SYNC_EXCHANGE = 'sync.exchange';

@Global()
@Module({
  imports: [
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
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
          }
        ],
        uri: configService.get<string>('RABBITMQ_URI')!,
        connectionInitOptions: { wait: false },
        enableControllerDiscovery: true,
      }),
    }),
    ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: './libs/common/.env.local',
    }),
  ],
  exports: [RabbitMQModule],
})
export class AppRabbitMQModule {}