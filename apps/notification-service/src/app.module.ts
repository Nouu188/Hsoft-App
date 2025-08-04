import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';
import { JobsModule } from './jobs/jobs.module';
import { ApiClientsModule } from '@app/api-clients';
import { FirebaseModule } from './firebase/firebase.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationHistory } from './history/notification-history.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/notification-service/.env.local',
    }),
    TypeOrmModule.forRootAsync({
      name: 'notificationConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('NOTIFICATION_DB_HOST'),
        port: +(configService.get<number>('NOTIFICATION_DB_PORT') as number),
        username: configService.get<string>('NOTIFICATION_DB_USER'),
        password: configService.get<string>('NOTIFICATION_DB_PASS'),
        database: configService.get<string>('NOTIFICATION_DB_NAME'),
        entities: [ NotificationHistory ], 
        synchronize: true,
      }),
    }),
    AppRabbitMQModule,
    JobsModule, 
    FirebaseModule,
    ApiClientsModule,
  ],
})
export class NotificationServiceModule {}
