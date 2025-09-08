import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationApiClientService } from './notification-api-client.service';
import { OutboxModule } from '@app/outbox';

@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
    }),
    ConfigModule,
    OutboxModule.forRoot()
  ],
  providers: [NotificationApiClientService],
  exports: [NotificationApiClientService],
})
export class NotificationApiClientModule {}