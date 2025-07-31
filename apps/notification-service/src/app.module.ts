import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';
import { JobsModule } from './jobs/jobs.module';
import { ApiClientsModule } from '@app/api-clients';
import { FirebaseModule } from './firebase/firebase.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/notification-service/.env.local',
    }),
    AppRabbitMQModule,
    JobsModule, 
    FirebaseModule,
    ApiClientsModule,
  ],
})
export class NotificationServiceModule {}
