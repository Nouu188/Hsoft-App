import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiClientsModule } from '@app/api-clients';
import { Dose } from '../doses/entities/dose.entity';
import { DosesSyncService } from './services/doses-sync.service';
import { SyncConsumer } from './consumers/doses-sync.consumer';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Dose]),
    ApiClientsModule,
    AppRabbitMQModule,
  ],
  providers: [
    DosesSyncService,
    SyncConsumer
  ],
})
export class JobsModule {}