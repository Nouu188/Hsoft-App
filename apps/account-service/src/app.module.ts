import { HospitalApiClientModule } from '@app/api-clients/hospital/hospital-api-client.module';
import { TenantApiClientModule } from '@app/api-clients/tenant/tenant-api-client.module';
import { MetricsInterceptor } from '@app/common/metrics/instrumentation/metrics.interceptor';
import { MetricsMiddleware } from '@app/common/metrics/instrumentation/metrics.middleware';
import { MetricsModule } from '@app/common/metrics/metrics.module';
import { OutboxModule } from '@app/outbox';
import { OutboxEntity } from '@app/outbox/entities/outbox.entity';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ServiceClient } from './auth/entities/service-client.entity';
import { RefreshToken } from './users/entities/refresh-token.entity';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { TokensModule } from './tokens/tokens.module';
import { OtpModule } from './otp/otp.module';
import { M2mModule } from './m2m/m2m.module';

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
        entities: [ User, RefreshToken, OutboxEntity ], 
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
        entities: [ ServiceClient, OutboxEntity ], 
        synchronize: true,
      }),
    }),  
    UsersModule, 
    AuthModule,
    TokensModule,
    OtpModule,
    M2mModule,
    OutboxModule,
    HospitalApiClientModule,
    MetricsModule,
    TenantApiClientModule,
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