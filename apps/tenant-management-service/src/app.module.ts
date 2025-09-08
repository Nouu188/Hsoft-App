import { OutboxEntity } from '@app/outbox/entities/outbox.entity';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ClinicsModule } from './clinics/clinics.module';
import { Clinic } from './clinics/entities/clinic.entity';
import { DoctorsModule } from './doctors/doctors.module';
import { Doctor } from './doctors/entities/doctor.entity';
import { Hospital } from './hospitals/entities/hospital.entity';
import { HospitalsModule } from './hospitals/hospitals.module';
import { Identity } from './identities/entities/identity.entity';
import { IdentitiesModule } from './identities/identities.module';
import { AuthApiClientModule } from '@app/api-clients/auth/auth-api-client.module';

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
        entities: [ Hospital, Clinic, Doctor, Identity, OutboxEntity ],
        synchronize: true,
      }),
    }),
    HospitalsModule,
    IdentitiesModule,
    DoctorsModule,
    ClinicsModule,
    AuthApiClientModule
  ],
})
export class TenantManagementServiceModule {}