import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryService } from './history.service';
import { NotificationHistory } from './entities/notification-history.entity';
import { HistoryResolver } from './history.resolver';
import { AuthLibModule } from '@app/auth';

@Module({
  imports: [
    TypeOrmModule.forFeature([ NotificationHistory ], 'notificationConnection'),
    AuthLibModule,
  ],
  providers: [HistoryService, HistoryResolver],
  exports: [HistoryService], 
})
export class HistoryModule {}