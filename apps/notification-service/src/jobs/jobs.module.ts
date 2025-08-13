import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JobsResolver } from './jobs.resolver';
import { NotificationConsumer } from './consumers/notification.consumer';
import { ApiClientsModule } from '@app/api-clients';
import { FirebaseModule } from '../firebase/firebase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationHistory } from '../history/entities/notification-history.entity';
import { NotificationService } from './notification.service';
import { HistoryModule } from '../history/history.module';

@Module({
  imports: [
    HttpModule, 
    ApiClientsModule,
    HistoryModule,
    FirebaseModule,
    TypeOrmModule.forFeature([ NotificationHistory ], 'notificationConnection'),
  ],
  providers: [
    NotificationConsumer, 
    NotificationService,
    JobsResolver, 
  ],
  exports: [NotificationConsumer, NotificationService]
})
export class JobsModule {}