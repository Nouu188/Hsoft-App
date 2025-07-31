import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiClientsModule } from '@app/api-clients';
import { Dose } from '../doses/entities/dose.entity';
import { TreatmentSyncService } from './services/treatment-sync.service';
import { SyncConsumer } from './consumers/treatment-sync.consumer';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Dose]),
    ApiClientsModule,
    AppRabbitMQModule,
  ],
  providers: [
    TreatmentSyncService,
    SyncConsumer
  ],
})
export class JobsModule {}