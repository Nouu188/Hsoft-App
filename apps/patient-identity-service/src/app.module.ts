import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentitiesModule } from './identities/identities.module';
import { AppRabbitMQModule } from '@app/common/rabbitmq';
import { PatientIdentity } from './identities/entities/patient-identity.entity';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AuthLibModule } from '@app/auth';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/patient-identity-service/schema.gql'),
      sortSchema: true,
      playground: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/patient-identity-service/.env.local',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('PATIENT_IDENTITY_DB_HOST'),
        port: +(configService.get<number>('PATIENT_IDENTITY_DB_PORT') as number),
        username: configService.get<string>('PATIENT_IDENTITY_DB_USER'),
        password: configService.get<string>('PATIENT_IDENTITY_DB_PASS'),
        database: configService.get<string>('PATIENT_IDENTITY_DB_NAME'),
        entities: [ PatientIdentity ],
        synchronize: true,
      }),
    }),
    AppRabbitMQModule,
    IdentitiesModule,
    AuthLibModule
  ],
})
export class PatientIdentityServiceModule {}