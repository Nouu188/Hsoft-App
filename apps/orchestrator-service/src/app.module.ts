import { Module } from '@nestjs/common';
import { OrchestratorService } from './app.service';
import { OrchestratorController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SagaEntity } from './entitites/saga.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/orchestrator-service/.env.local',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/orchestrator-service/schema.gql'),
      sortSchema: true,
      playground: true,
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
        entities: [ SagaEntity ],
        synchronize: true,
      }),
    }),
  ],
  controllers: [OrchestratorController],
  providers: [OrchestratorService],
})
export class OrchestratorServiceModule {}
