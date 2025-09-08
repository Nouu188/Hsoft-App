import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JobsResolver } from './jobs.resolver';
import { NotificationConsumer } from './consumers/notification.consumer';
import { ApiClientsModule } from '@app/api-clients';
import { FirebaseModule } from '../firebase/firebase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationHistory } from '../history/entities/notification-history.entity';
import { NotificationService } from './services/notification.service';
import { HistoryModule } from '../history/history.module';
import { ConfigModule } from '@nestjs/config';
import { AllMetricsProviders } from '@app/common/metrics/providers';
import { AccountApiClientModule } from '@app/api-clients/account/account-api-client.module';
import { DoseApiClientModule } from '@app/api-clients/doses/dose-api-client.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule, 
    AccountApiClientModule,
    DoseApiClientModule,
    HistoryModule,
    FirebaseModule,
    TypeOrmModule.forFeature([ NotificationHistory ], 'notificationConnection'),
  ],
  providers: [
    NotificationConsumer, 
    NotificationService,
    JobsResolver, 
    ...AllMetricsProviders
  ],
  exports: [NotificationConsumer, NotificationService]
})
export class JobsModule {}