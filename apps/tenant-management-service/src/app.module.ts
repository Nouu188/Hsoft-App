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
import { GetAllDoctorsHandler, GetAvailableDoctorsHandler, GetDoctorByIdHandler, GetDoctorsFromHospitalHandler } from './application/queries/doctors/handlers';
import { Clinic, Doctor, Hospital, IClinicRepository, Identity, IDoctorRepository, IHospitalRepository, IIdentityRepository, MedicalService } from './domain';
import { ClinicTransactionService, DoctorTransactionService, HospitalTransactionService, IdentityTransactionService, OutboxTransactionService } from './infrastructure/common/services/transaction.service';
import { DoctorRepository } from './infrastructure/repositories/doctors';
import { ClinicsResolver, HospitalsResolver, IdentitiesResolver } from './presentation/graphql/resolvers';
import { DoctorsResolver } from './presentation/graphql/resolvers/doctors';
import { ClinicRepository, HospitalRepository, IdentityRepository } from './infrastructure';
import { GetActiveClinicsHandler, GetAllHospitalsHandler, GetHospitalByExternalCodeHandler, GetHospitalByIdHandler, GetIdentityByIdQueryHandler, GetIdentityByUserIdQueryHandler, GetIdentityFromHospitalHandler, GetManyIdentitiesQueryHandler } from './application/queries';
import { CreateHospitalHandler, CreateIdentityHandler, RemoveHospitalHandler, SyncClinicsFromHospitalHandler, SyncDoctorsFromHospitalHandler, UpdateHospitalHandler, UpsertClinicsHandler } from './application/commands';
import { IdentityCreatedConsumer } from './application';
import { SyncController } from './presentation';
import { IMedicalServiceRepository } from './domain/interfaces/medical-service';
import { MedicalServiceRepository } from './infrastructure/repositories/medical-service/medical-service.repository';

export const CommandHandlers = [
  UpsertClinicsHandler,
  
  CreateHospitalHandler,
  RemoveHospitalHandler,
  UpdateHospitalHandler,

  CreateIdentityHandler,

  SyncDoctorsFromHospitalHandler,
  SyncClinicsFromHospitalHandler,
];

export const QueryHandlers = [
  GetAllHospitalsHandler,
  GetHospitalByExternalCodeHandler,
  GetHospitalByIdHandler,

  GetDoctorByIdHandler,
  GetAllDoctorsHandler,
  GetAvailableDoctorsHandler,
  GetDoctorsFromHospitalHandler,

  GetActiveClinicsHandler,

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
  { provide: IMedicalServiceRepository, useClass: MedicalServiceRepository }
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
  SyncController
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
        entities: [Hospital, Clinic, Doctor, MedicalService, Identity, OutboxEntity],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Hospital, Clinic, Doctor, Identity, MedicalService, OutboxEntity], 'tenantConnection'),

    OutboxModule.forRoot('tenantConnection'),
    MetricsModule,
    AuthLibModule,
    HospitalApiClientModule,
    TenantManagementServiceModule,

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
