import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationHistory } from './entities/notification-history.entity';
import { AuthLibModule } from '@app/auth';
import { AllMetricsProviders } from '@app/common/metrics/providers';
import { NotificationHistoryService } from './notification-history.service';
import { NotificationHistoryResolver } from './notification-history.resolver';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ NotificationHistory ], 'notificationConnection'),
    AuthLibModule
  ],
  providers: [NotificationHistoryService, NotificationHistoryResolver, ...AllMetricsProviders],
  exports: [NotificationHistoryService], 
})
export class NotificationHistoryModule {}