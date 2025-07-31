import { Module } from '@nestjs/common';
import { NotificationApiClientService } from './notification-api-client.service';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';

@Module({
  imports: [AppRabbitMQModule],
  providers: [NotificationApiClientService],
  exports: [NotificationApiClientService],
})
export class NotificationApiClientModule {}