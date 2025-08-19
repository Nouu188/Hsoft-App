import { Module } from '@nestjs/common';
import { NotificationApiClientService } from './notification-api-client.service';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AppRabbitMQModule, ConfigModule],
  providers: [NotificationApiClientService],
  exports: [NotificationApiClientService],
})
export class NotificationApiClientModule {}