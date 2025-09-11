import { Module, DynamicModule, Provider } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { OutboxService } from './outbox.service';
import { OutboxProcessor } from './outbox.processor';
import { OutboxEntity } from './entities/outbox.entity';
import { Repository } from 'typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ScheduleModule } from '@nestjs/schedule';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';

@Module({})
export class OutboxModule {
  static forRoot(connectionName: string): DynamicModule {
    const serviceToken = `OutboxService_${connectionName}`;
    const processorToken = `OutboxProcessor_${connectionName}`;

    const outboxServiceProvider: Provider = {
      provide: serviceToken,
      useFactory: (repo: Repository<OutboxEntity>) =>
        new OutboxService(repo),
      inject: [getRepositoryToken(OutboxEntity, connectionName)],
    };

    const outboxProcessorProvider: Provider = {
      provide: processorToken,
      useFactory: (repo: Repository<OutboxEntity>, amqp: AmqpConnection) =>
        new OutboxProcessor(repo, amqp),
      inject: [getRepositoryToken(OutboxEntity, connectionName), AmqpConnection],
    };

    return {
      module: OutboxModule,
      imports: [
        TypeOrmModule.forFeature([OutboxEntity], connectionName),
        ScheduleModule.forRoot(),
        AppRabbitMQModule
      ],
      providers: [outboxServiceProvider, outboxProcessorProvider],
      exports: [outboxServiceProvider],
    };
  }
}
