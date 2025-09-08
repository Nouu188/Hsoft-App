import { AuthApiClientModule } from '@app/api-clients/auth/auth-api-client.module';
import { GraphQLJSONObject } from '@app/common/graphql/json.scalar';
import { MetricsInterceptor } from '@app/common/metrics/instrumentation/metrics.interceptor';
import { MetricsMiddleware } from '@app/common/metrics/instrumentation/metrics.middleware';
import { MetricsModule } from '@app/common/metrics/metrics.module';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { FirebaseModule } from './firebase/firebase.module';
import { JobsModule } from './jobs/jobs.module';
import { NotificationHistory } from './notification-history/entities/notification-history.entity';
import { NotificationHistoryModule } from './notification-history/notification-history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/notification-service/.env.local',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/notification-service/schema.gql'),
      sortSchema: true,
      playground: true,
      resolvers: { JSONObject: GraphQLJSONObject },
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
    NotificationHistoryModule,
    MetricsModule,
    AuthApiClientModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    }
  ],
  exports: [
    ConfigModule, 
  ]
})
export class NotificationServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
