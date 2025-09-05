import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { UserRegistrationSaga } from './sagas/user-registration/entities/user-registration-saga.entity';
import { UserRegistrationModule } from './sagas/user-registration/user-registration.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/orchestrator-service/.env.local',
    }),
    TypeOrmModule.forRootAsync({
      name: 'orchestratorConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('ORCHESTRATOR_DB_HOST'),
        port: +(configService.get<number>('ORCHESTRATOR_DB_PORT') as number),
        username: configService.get<string>('ORCHESTRATOR_DB_USER'),
        password: configService.get<string>('ORCHESTRATOR_DB_PASS'),
        database: configService.get<string>('ORCHESTRATOR_DB_NAME'),
        entities: [ UserRegistrationSaga ],
        synchronize: true,
      }),
    }),
    UserRegistrationModule,
  ],
  providers: [],
})
export class OrchestratorServiceModule {}
