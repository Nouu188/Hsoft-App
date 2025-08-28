import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { HospitalApiClientModule } from '@app/api-clients/hospital/hospital-api-client.module';
import { User } from './users/entities/user.entity';
import { AuthLibModule } from '@app/auth';
import { ServiceClient } from './auth/entities/service-client.entity';
import { AuthModule } from './auth/auth.module';
import { MetricsModule } from '@app/common/metrics/metrics.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MetricsInterceptor } from '@app/common/metrics/metrics.interceptor';
import { MetricsMiddleware } from '@app/common/metrics/metrics.middleware';
import { TenantApiClientModule } from '@app/api-clients/tenant/tenant-api-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/account-service/.env.local',
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'apps/account-service/schema.gql'),
      sortSchema: true,
      path: '/graphql',
      playground: true, 
    }),
    TypeOrmModule.forRootAsync({
      name: 'accountConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('ACCOUNTS_DB_HOST'),
        port: +(configService.get<number>('ACCOUNTS_DB_PORT') as number),
        username: configService.get<string>('ACCOUNTS_DB_USER'),
        password: configService.get<string>('ACCOUNTS_DB_PASS'),
        database: configService.get<string>('ACCOUNTS_DB_NAME'),
        entities: [ User ], 
        synchronize: true,
      }),
    }),    
    TypeOrmModule.forRootAsync({
      name: 'authConnection',
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('AUTH_DB_HOST'),
        port: +(configService.get<number>('AUTH_DB_PORT') as number),
        username: configService.get<string>('AUTH_DB_USER'),
        password: configService.get<string>('AUTH_DB_PASS'),
        database: configService.get<string>('AUTH_DB_NAME'),
        entities: [ ServiceClient ], 
        synchronize: true,
      }),
    }),  
    UsersModule, 
    AuthLibModule,
    AuthModule,
    HospitalApiClientModule,
    MetricsModule,
    TenantApiClientModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
  exports: [
    ConfigModule,
  ]
})

export class AccountServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}