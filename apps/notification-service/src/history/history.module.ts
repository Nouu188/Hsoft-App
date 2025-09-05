import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryService } from './history.service';
import { NotificationHistory } from './entities/notification-history.entity';
import { HistoryResolver } from './history.resolver';
import { AuthLibModule } from '@app/auth';
import { AllMetricsProviders } from '@app/common/metrics/providers';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ NotificationHistory ], 'notificationConnection'),
    AuthLibModule
  ],
  providers: [HistoryService, HistoryResolver, ...AllMetricsProviders],
  exports: [HistoryService], 
})
export class HistoryModule {}