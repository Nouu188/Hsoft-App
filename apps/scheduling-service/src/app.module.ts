import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DosesModule } from './doses/doses.module';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Dose } from './doses/entities/dose.entity';
import { HttpModule } from '@nestjs/axios';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ApiClientsModule } from '@app/api-clients';
import { JobsModule } from './jobs/jobs.module';
import { AuthLibModule } from '@app/auth';
import { GraphQLJSONObject } from 'graphql-type-json';
import { DateTimeScalar } from '@app/common/graphql/datetime.scalar';
import { MetricsModule } from '@app/common/metrics/metrics.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsInterceptor } from '@app/common/metrics/metrics.interceptor';
import { MetricsMiddleware } from '@app/common/metrics/metrics.middleware';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/scheduling-service/schema.gql'),
      sortSchema: true,
      playground: true,
      resolvers: { JSONObject: GraphQLJSONObject },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/scheduling-service/.env.local',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('SCHEDULES_DB_HOST'),
        port: +(configService.get<number>('SCHEDULES_DB_PORT') as number),
        username: configService.get<string>('SCHEDULES_DB_USER'),
        password: configService.get<string>('SCHEDULES_DB_PASS'),
        database: configService.get<string>('SCHEDULES_DB_NAME'),
        entities: [Dose],
        synchronize: true,
      }),
    }),
    AppRabbitMQModule,
    HttpModule,
    DosesModule,
    ApiClientsModule,
    AuthLibModule,
    JobsModule,
    MetricsModule
  ],
  providers: [
    DateTimeScalar,
    ConfigModule,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    }
  ],
})
export class SchedulingServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
