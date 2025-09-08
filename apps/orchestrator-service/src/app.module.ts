import { OutboxEntity } from '@app/outbox/entities/outbox.entity';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRegistrationSaga } from './sagas/user-registration/entities/user-registration-saga.entity';
import { UserRegistrationModule } from './sagas/user-registration/user-registration.module';
import { AuthApiClientModule } from '@app/api-clients/auth/auth-api-client.module';

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
        entities: [ UserRegistrationSaga, OutboxEntity ],
        synchronize: true,
      }),
    }),
    UserRegistrationModule,
    AuthApiClientModule
  ],
  providers: [],
})
export class OrchestratorServiceModule {}
