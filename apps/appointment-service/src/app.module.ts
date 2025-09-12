import { AuthLibModule } from '@app/auth';
import { MetricsInterceptor } from '@app/common/metrics/instrumentation/metrics.interceptor';
import { MetricsMiddleware } from '@app/common/metrics/instrumentation/metrics.middleware';
import { OutboxModule } from '@app/outbox';
import { OutboxEntity } from '@app/outbox/entities/outbox.entity';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { CancelAppointmentCommandHandler, GetAppointmentsByUserIdHandler } from './application';
import { Appointment, IAppointmentRepository } from './domain';
import { AppointmentRepository } from './infrastructure/repositories/appointments/appoinment.repository';
import { AppointmentsResolver } from './presentation/graphql/resolvers';
import { AppointmentTransactionService } from './infrastructure/common';
import { TenantApiClientModule } from '@app/api-clients/tenant/tenant-api-client.module';
import { MetricsModule } from '@app/common/metrics/metrics.module';

export const CommandHandlers = [
  CancelAppointmentCommandHandler,

  GetAppointmentsByUserIdHandler
];

export const Repositories = [
  { provide: IAppointmentRepository, useClass: AppointmentRepository }
];
export const InfrastructureServices = [
  AppointmentTransactionService
];
export const Resolvers = [
  AppointmentsResolver
];
export const Controllers = [

];
export const Strategies = [

];
export const Consumers = [

];
export const Services = [
  
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/appointment-service/.env.local',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/appointment-service/schema.gql'),
      sortSchema: true,
      path: '/graphql',
      playground: true,
    }),
    TypeOrmModule.forRootAsync({
      name: 'appointmentConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('APPOINTMENT_DB_HOST'),
        port: +(configService.get<number>('APPOINTMENT_DB_PORT') as number),
        username: configService.get<string>('APPOINTMENT_DB_USER'),
        password: configService.get<string>('APPOINTMENT_DB_PASS'),
        database: configService.get<string>('APPOINTMENT_DB_NAME'),
        entities: [Appointment, OutboxEntity],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Appointment, OutboxEntity], 'appointmentConnection'),

    TenantApiClientModule,
    AuthLibModule,
    MetricsModule,
    OutboxModule.forRoot('appointmentConnection'),

    CqrsModule,
  ],
  controllers: [
    ...Controllers,
  ],
  providers: [
    ...CommandHandlers,
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
export class AppointmentServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
