import { AccountApiClientModule } from '@app/api-clients/account/account-api-client.module';
import { DoseApiClientModule } from '@app/api-clients/doses/dose-api-client.module';
import { AllMetricsProviders } from '@app/common/metrics/providers';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { FirebaseModule } from '../firebase/firebase.module';
import { NotificationHistory } from '../notification-history/entities/notification-history.entity';
import { NotificationHistoryModule } from '../notification-history/notification-history.module';
import { EmailConsumer } from './consumers/email.consumer';
import { NotificationConsumer } from './consumers/notification.consumer';
import { JobsResolver } from './jobs.resolver';
import { EmailService } from './services/email.service';
import { NotificationService } from './services/notification.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule, 
    AccountApiClientModule,
    DoseApiClientModule,
    NotificationHistoryModule,
    FirebaseModule,
    TypeOrmModule.forFeature([ NotificationHistory ], 'notificationConnection'),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: false,
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"MedPlusApp" <${configService.get<string>('SMTP_FROM')}>`,
        },
        template: {
          dir: join(process.cwd(), 'apps/notification-service/src/auth/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [
    NotificationConsumer, 
    NotificationService,
    EmailService,
    EmailConsumer,
    JobsResolver, 
    ...AllMetricsProviders
  ],
  exports: [NotificationConsumer, NotificationService]
})
export class JobsModule {}