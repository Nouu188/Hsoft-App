import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiClientsModule } from '@app/api-clients';
import { Dose } from '../doses/entities/dose.entity';
import { DosesSyncService } from './services/doses-sync.service';
import { SyncConsumer } from './consumers/doses-sync.consumer';
import { BatchCreationConsumer } from './consumers/batch-doses-creation.consumer';
import { BatchSyncConsumer } from './consumers/batch-doses-sync.consumer';
import { DoseStatusTransitionService } from './services/dose-status-transition.service';
import { ConfigModule } from '@nestjs/config';
import { DosesSyncAllConsumer } from './consumers/doses-sync-all.consumer';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule,
    TypeOrmModule.forFeature([Dose]),
    ApiClientsModule,
    AppRabbitMQModule,
  ],
  providers: [
    DosesSyncService,
    DoseStatusTransitionService, 
    SyncConsumer,
    DosesSyncAllConsumer,
    BatchCreationConsumer,
    BatchSyncConsumer,
  ],
})
export class JobsModule {}