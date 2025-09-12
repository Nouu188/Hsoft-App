import { HospitalApiClientModule } from '@app/api-clients/hospital/hospital-api-client.module';
import { AuthLibModule } from '@app/auth';
import { MetricsInterceptor } from '@app/common/metrics/instrumentation/metrics.interceptor';
import { MetricsMiddleware } from '@app/common/metrics/instrumentation/metrics.middleware';
import { MetricsModule } from '@app/common/metrics/metrics.module';
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
import { CreateHospitalHandler, GetIdentityByIdQueryHandler, GetIdentityByUserIdQueryHandler, GetIdentityFromHospitalHandler, GetManyIdentitiesQueryHandler, RemoveHospitalHandler, UpdateHospitalHandler } from './application';
import { UpsertClinicsHandler } from './application/clinics';
import { GetActiveClinicsHandler } from './application/clinics/queries/handlers';
import { GetAllDoctorsHandler, GetAvailableDoctorsHandler, GetDoctorByIdHandler } from './application/doctors/queries/handlers';
import { CreateIdentityHandler } from './application/identities/commands/handlers';
import { Clinic, Doctor, Hospital, IClinicRepository, Identity, IDoctorRepository, IHospitalRepository, IIdentityRepository } from './domain';
import { ClinicTransactionService, DoctorTransactionService, HospitalTransactionService, IdentityTransactionService, OutboxTransactionService } from './infrastructure/common/services/transaction.service';
import { DoctorRepository } from './infrastructure/repositories/doctors';
import { ClinicsResolver, HospitalsResolver, IdentitiesResolver } from './presentation/graphql/resolvers';
import { DoctorsResolver } from './presentation/graphql/resolvers/doctors';
import { ClinicRepository, HospitalRepository, IdentityRepository } from './infrastructure';
import { IdentityCreatedConsumer } from './infrastructure/rabbitmq';

export const CommandHandlers = [
  GetActiveClinicsHandler,
  GetActiveClinicsHandler,
  UpsertClinicsHandler,

  GetDoctorByIdHandler,
  GetAllDoctorsHandler,
  GetAvailableDoctorsHandler,

  CreateHospitalHandler,
  RemoveHospitalHandler,
  UpdateHospitalHandler,

  CreateIdentityHandler,
  GetIdentityByIdQueryHandler,
  GetIdentityByUserIdQueryHandler,
  GetManyIdentitiesQueryHandler,
  GetIdentityFromHospitalHandler
];

export const Repositories = [
  { provide: IClinicRepository, useClass: ClinicRepository },
  { provide: IDoctorRepository, useClass: DoctorRepository },
  { provide: IHospitalRepository, useClass: HospitalRepository },
  { provide: IIdentityRepository, useClass: IdentityRepository },
];
export const InfrastructureServices = [
  ClinicTransactionService,
  DoctorTransactionService,
  HospitalTransactionService,
  IdentityTransactionService,
  OutboxTransactionService,
];
export const Resolvers = [
  DoctorsResolver,
  ClinicsResolver,
  HospitalsResolver,
  IdentitiesResolver,
];
export const Controllers = [

];
export const Strategies = [

];
export const Consumers = [
  IdentityCreatedConsumer
];

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/tenant-management-service/schema.gql'),
      sortSchema: true,
      playground: true,
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/tenant-management-service/.env.local',
    }),

    TypeOrmModule.forRootAsync({
      name: 'tenantConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('TENANT_MANAGEMENT_DB_HOST'),
        port: +(configService.get<number>('TENANT_MANAGEMENT_DB_PORT') as number),
        username: configService.get<string>('TENANT_MANAGEMENT_DB_USER'),
        password: configService.get<string>('TENANT_MANAGEMENT_DB_PASS'),
        database: configService.get<string>('TENANT_MANAGEMENT_DB_NAME'),
        entities: [Hospital, Clinic, Doctor, Identity, OutboxEntity],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Hospital, Clinic, Doctor, Identity, OutboxEntity], 'tenantConnection'),

    OutboxModule.forRoot('tenantConnection'),
    MetricsModule,
    AuthLibModule,
    HospitalApiClientModule,

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
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
  exports: [ConfigModule],
})
export class TenantManagementServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
