import { AccountApiClientModule } from '@app/api-clients/account/account-api-client.module';
import { AuthApiClientModule } from '@app/api-clients/auth/auth-api-client.module';
import { HospitalApiClientModule } from '@app/api-clients/hospital/hospital-api-client.module';
import { TenantApiClientModule } from '@app/api-clients/tenant/tenant-api-client.module';
import { AuthLibModule } from '@app/auth';
import { GraphQLJSONObject } from '@app/common/graphql/json.scalar';
import { MetricsInterceptor } from '@app/common/metrics/instrumentation/metrics.interceptor';
import { MetricsMiddleware } from '@app/common/metrics/instrumentation/metrics.middleware';
import { MetricsModule } from '@app/common/metrics/metrics.module';
import { OutboxModule } from '@app/outbox';
import { OutboxEntity } from '@app/outbox/entities/outbox.entity';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { HttpModule } from '@nestjs/axios';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { DosesAllSyncConsumer, DoseStatusTransitionJobService, GetDosesByDateRangeQuery, SyncAllDosesByUserHandler, SyncDosesInFutureHandler, UpdateDosesCommandHandler } from './application';
import { Dose, DoseSchedulerService, DoseStatusTransitionService, IDoseRepository } from './domain';
import { DoseRepository, DoseTransactionService, OutboxTransactionService } from './infrastructure';
import { DosesResolver } from './presentation/graphql/resolvers/doses';
import { GetDoseByIdQueryHandler, GetDosesByDateRangeQueryHandler, GetDosesBySelectedDateQueryHandler } from './application/queries/dose/handlers';

export const CommandHandlers = [
  SyncAllDosesByUserHandler,
  SyncDosesInFutureHandler,
  UpdateDosesCommandHandler,
];

export const QueryHandlers = [
  GetDoseByIdQueryHandler,
  GetDosesByDateRangeQueryHandler,
  GetDosesBySelectedDateQueryHandler
];

export const Repositories = [
  { provide: IDoseRepository, useClass: DoseRepository }
];
export const InfrastructureServices = [
  OutboxTransactionService,
  DoseTransactionService
];
export const Resolvers = [
  DosesResolver
];
export const Controllers = [
  
];
export const Strategies = [

];
export const Consumers = [
  DosesAllSyncConsumer,
];
export const Services = [
  DoseSchedulerService,
  DoseStatusTransitionJobService,
  DoseStatusTransitionService
];

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
      name: 'schedulingConnection',
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
    TypeOrmModule.forFeature([ Dose, OutboxEntity ], 'schedulingConnection'),

    HttpModule,
    MetricsModule,
    AuthApiClientModule,
    AccountApiClientModule,
    HospitalApiClientModule,
    TenantApiClientModule,
    AuthLibModule,
    OutboxModule.forRoot('schedulingConnection'),

    CqrsModule,
  ],
  controllers: [
    ...Controllers,
  ],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers, 
    ...Repositories,
    ...InfrastructureServices,
    ...Resolvers,
    ...Strategies,
    ...Consumers,
    ...Services,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
  exports: [ConfigModule],
})
export class SchedulingServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
