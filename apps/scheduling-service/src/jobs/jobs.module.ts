import { AccountApiClientModule } from '@app/api-clients/account/account-api-client.module';
import { HospitalApiClientModule } from '@app/api-clients/hospital/hospital-api-client.module';
import { NotificationApiClientModule } from '@app/api-clients/notification/notification-api-client.module';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';
import { OutboxModule } from '@app/outbox';
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

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([ Dose ]),
    HospitalApiClientModule,
    NotificationApiClientModule,
    AccountApiClientModule,
    AppRabbitMQModule,
    OutboxModule.forRoot(),
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