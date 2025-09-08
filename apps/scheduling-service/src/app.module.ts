import { DateTimeScalar } from '@app/common/graphql/datetime.scalar';
import { MetricsInterceptor } from '@app/common/metrics/instrumentation/metrics.interceptor';
import { MetricsMiddleware } from '@app/common/metrics/instrumentation/metrics.middleware';
import { MetricsModule } from '@app/common/metrics/metrics.module';
import { OutboxEntity } from '@app/outbox/entities/outbox.entity';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLJSONObject } from 'graphql-type-json';
import { join } from 'path';
import { DosesModule } from './doses/doses.module';
import { Dose } from './doses/entities/dose.entity';
import { JobsModule } from './jobs/jobs.module';
import { AuthApiClientModule } from '@app/api-clients/auth/auth-api-client.module';

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
        entities: [ Dose, OutboxEntity ],
        synchronize: true,
      }),
    }),
    HttpModule,
    DosesModule,
    JobsModule,
    MetricsModule,
    AuthApiClientModule,
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
