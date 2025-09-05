import { Module, DynamicModule, Provider } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { OutboxService } from './outbox.service';
import { OutboxProcessor } from './outbox.processor';
import { OutboxEntity } from './entities/outbox.entity';
import { Repository } from 'typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';

@Module({})
export class OutboxModule {
  static forRoot(connectionName?: string): DynamicModule {
    const outboxProcessorProvider: Provider = {
      provide: OutboxProcessor,
      useFactory: (
        outboxRepository: Repository<OutboxEntity>,
        amqpConnection: AmqpConnection,
      ) => {
        return new OutboxProcessor(outboxRepository, amqpConnection);
      },
      inject: [
        getRepositoryToken(OutboxEntity, connectionName),
        AmqpConnection,
      ],
    };

    const outboxServiceProvider: Provider = {
      provide: OutboxService,
      useFactory: (outboxRepository: Repository<OutboxEntity>) => {
        return new OutboxService(outboxRepository);
      },
      inject: [getRepositoryToken(OutboxEntity, connectionName)],
    };

    return {
      module: OutboxModule,
      imports: [
        TypeOrmModule.forFeature([OutboxEntity], connectionName),
      ],
      providers: [
        outboxServiceProvider,
        outboxProcessorProvider
      ],
      exports: [OutboxService],
    };
  }
}