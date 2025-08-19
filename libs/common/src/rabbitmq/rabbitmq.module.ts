import { RabbitMQModule } from '@golevelup/nestjs-rabbitmq';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Exchanges } from './exchanges';
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
          exchanges: Exchanges,
          uri,
          prefetchCount: 10,
          retryAttempts: 10,
          retryDelay: 5000, 
          connectionInitOptions: { wait: false },
          enableControllerDiscovery: true,
        };
      }
    }),
  ],
  exports: [RabbitMQModule],
})
export class AppRabbitMQModule { }