import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/immunization-service/.env.local',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/immunization-service/schema.gql'),
      sortSchema: true,
      path: '/graphql',
      playground: true, 
    }),
    TypeOrmModule.forRootAsync({
      name: 'immunizationConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('IMMUNIZATION_DB_HOST'),
        port: +(configService.get<number>('IMMUNIZATION_DB_PORT') as number),
        username: configService.get<string>('IMMUNIZATION_DB_USER'),
        password: configService.get<string>('IMMUNIZATION_DB_PASS'),
        database: configService.get<string>('IMMUNIZATION_DB_NAME'),
        entities: [ ], 
        synchronize: true,
      }),
    }), 
  ],
  providers: [],
})
export class ImmunizationServiceModule {}
