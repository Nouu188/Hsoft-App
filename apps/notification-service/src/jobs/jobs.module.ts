import { AccountApiClientModule } from '@app/api-clients/account/account-api-client.module';
import { DoseApiClientModule } from '@app/api-clients/doses/dose-api-client.module';
import { AllMetricsProviders } from '@app/common/metrics/providers';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseModule } from '../firebase/firebase.module';
import { NotificationHistory } from '../notification-history/entities/notification-history.entity';
import { NotificationConsumer } from './consumers/notification.consumer';
import { JobsResolver } from './jobs.resolver';
import { NotificationService } from './services/notification.service';
import { NotificationHistoryModule } from '../notification-history/notification-history.module';

@Module({
  imports: [
    ConfigModule,
    HttpModule, 
    AccountApiClientModule,
    DoseApiClientModule,
    NotificationHistoryModule,
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