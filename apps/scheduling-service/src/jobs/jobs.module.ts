import { ApiClientsModule } from '@app/api-clients';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dose } from '../doses/entities/dose.entity';
import { BatchCreationConsumer } from './consumers/batch-doses-creation.consumer';
import { BatchSyncConsumer } from './consumers/batch-doses-sync.consumer';
import { DoseHistorySyncConsumer } from './consumers/dose-history-sync.consumer.ts';
import { SyncConsumer } from './consumers/doses-sync.consumer';
import { DoseStatusTransitionService } from './services/dose-status-transition.service';
import { DosesSyncService } from './services/doses-sync.service';
import { OutboxModule } from '@app/outbox';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([Dose]),
    ApiClientsModule,
    AppRabbitMQModule,
    OutboxModule,
  ],
  providers: [
    DosesSyncService,
    DoseStatusTransitionService, 
    SyncConsumer,
    DoseHistorySyncConsumer,
    BatchCreationConsumer,
    BatchSyncConsumer,
  ],
})
export class JobsModule {}