import { Module } from '@nestjs/common';
import { BillingServiceController } from './app.controller';
import { BillingServiceService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/abilling-service/.env.local',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/billing-service/schema.gql'),
      sortSchema: true,
      path: '/graphql',
      playground: true,
    }),
    TypeOrmModule.forRootAsync({
      name: 'billingConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('BILLING_DB_HOST'),
        port: +(configService.get<number>('BILLING_DB_PORT') as number),
        username: configService.get<string>('BILLING_DB_USER'),
        password: configService.get<string>('BILLING_DB_PASS'),
        database: configService.get<string>('BILLING_DB_NAME'),
        entities: [],
        synchronize: true,
      }),
    }),
  ],
  controllers: [BillingServiceController],
  providers: [BillingServiceService],
})
export class BillingServiceModule { }
