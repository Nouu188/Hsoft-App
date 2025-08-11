import { Module } from '@nestjs/common';
import { DosesModule } from './doses/doses.module';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Dose } from './doses/entities/dose.entity';
import { HttpModule } from '@nestjs/axios';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ApiClientsModule } from '@app/api-clients';
import { JobsModule } from './jobs/jobs.module';
import { AuthLibModule } from '@app/auth';
import { GraphQLJSONObject } from 'graphql-type-json';

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
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST'),
        port: +(configService.get<number>('POSTGRES_PORT') as number),
        username: configService.get<string>('POSTGRES_USER'),
        password: configService.get<string>('POSTGRES_PASSWORD'),
        database: configService.get<string>('POSTGRES_DB'),
        entities: [Dose],
        synchronize: true,
      }),
    }),
    AppRabbitMQModule,
    HttpModule,
    DosesModule,
    ApiClientsModule,
    AuthLibModule,
    JobsModule,
  ],
  providers: [],
})
export class SchedulingServiceModule { }
