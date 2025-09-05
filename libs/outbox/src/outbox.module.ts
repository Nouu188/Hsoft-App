// libs/outbox/src/outbox.module.ts

import { Module, DynamicModule, Provider } from '@nestjs/common';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { OutboxService } from './outbox.service';
import { OutboxProcessor } from './outbox.processor';
import { OutboxEntity } from './entities/outbox.entity';
import { Repository } from 'typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq'; // Giả sử bạn dùng thư viện này

@Module({})
export class OutboxModule {
  static forRoot(connectionName?: string): DynamicModule {
    // 1. Tạo provider động cho Repository
    // Điều này đảm bảo chúng ta luôn inject đúng repository tương ứng với connectionName
    const outboxRepositoryProvider: Provider = {
      provide: getRepositoryToken(OutboxEntity, connectionName),
      useFactory: (repo: Repository<OutboxEntity>) => repo,
      inject: [getRepositoryToken(OutboxEntity, connectionName)],
    };
 
    // 2. Tạo provider động cho OutboxProcessor
    // Chúng ta inject Repository và AmqpConnection vào đây
    const outboxProcessorProvider: Provider = {
      provide: OutboxProcessor,
      useFactory: (
        outboxRepository: Repository<OutboxEntity>,
        amqpConnection: AmqpConnection, // Đảm bảo AmqpConnection đã được cung cấp ở module cha
      ) => {
        return new OutboxProcessor(outboxRepository, amqpConnection);
      },
      inject: [
        getRepositoryToken(OutboxEntity, connectionName), // Sử dụng token chính xác!
        AmqpConnection, // Hoặc token của message broker client của bạn
      ],
    };

    // 3. Cập nhật OutboxService provider để sử dụng token repository đúng
    const outboxServiceProvider: Provider = {
      provide: OutboxService,
      useFactory: (outboxRepository: Repository<OutboxEntity>) => {
        return new OutboxService(outboxRepository);
      },
      inject: [getRepositoryToken(OutboxEntity, connectionName)], // Sử dụng token chính xác!
    };
    
    // Module sẽ import TypeOrmModule và cung cấp các provider đã được cấu hình động
    return {
      module: OutboxModule,
      imports: [
        TypeOrmModule.forFeature([OutboxEntity], connectionName),
        // Bạn cần đảm bảo module cung cấp AmqpConnection (hoặc RabbitMQ client) được import
        // ở module gọi forRoot (ví dụ: AuthModule).
      ],
      providers: [
        outboxServiceProvider, 
        outboxProcessorProvider
      ],
      exports: [OutboxService],
    };
  }
}