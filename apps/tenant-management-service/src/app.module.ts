import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalsModule } from './hospitals/hospitals.module';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { Hospital } from './hospitals/entities/hospital.entity';
import { AppRabbitMQModule } from '@app/common/rabbitmq';

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
      envFilePath: './apps/scheduling-service/.env.local',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('TENANT_MANAGEMENT_DB_HOST'),
        port: +(configService.get<number>('TENANT_MANAGEMENT_DB_PORT') as number),
        username: configService.get<string>('TENANT_MANAGEMENT_DB_USER'),
        password: configService.get<string>('TENANT_MANAGEMENT_DB_PASS'),
        database: configService.get<string>('TENANT_MANAGEMENT_DB_NAME'),
        entities: [ Hospital ],
        synchronize: true,
      }),
    }),
    AppRabbitMQModule,
    HospitalsModule,
  ],
})
export class TenantManagementServiceModule {}