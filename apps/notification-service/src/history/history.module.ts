import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryService } from './history.service';
import { NotificationHistory } from './entities/notification-history.entity';
import { HistoryResolver } from './history.resolver';
import { AuthLibModule } from '@app/auth';
import { MetricsModule } from '@app/common/metrics/metrics.module';
import { CommonMetricsProviders } from '@app/common/metrics/metrics.provider';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([ NotificationHistory ], 'notificationConnection'),
    AuthLibModule
  ],
  providers: [HistoryService, HistoryResolver, ...CommonMetricsProviders],
  exports: [HistoryService], 
})
export class HistoryModule {}