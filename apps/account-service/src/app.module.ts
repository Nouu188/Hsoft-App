import { HospitalApiClientModule } from '@app/api-clients/hospital/hospital-api-client.module';
import { TenantApiClientModule } from '@app/api-clients/tenant/tenant-api-client.module';
import { AuthLibModule } from '@app/auth';
import { MetricsInterceptor } from '@app/common/metrics/instrumentation/metrics.interceptor';
import { MetricsMiddleware } from '@app/common/metrics/instrumentation/metrics.middleware';
import { MetricsModule } from '@app/common/metrics/metrics.module';
import { OutboxModule } from '@app/outbox';
import { OutboxEntity } from '@app/outbox/entities/outbox.entity';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CacheModule } from '@nestjs/cache-manager';
import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { GraphQLModule } from '@nestjs/graphql';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { OAuth2Client } from 'google-auth-library';
import { join } from 'path';
import { FcmTokenRegisterationHandler } from './application';
import { CompleteEmailRegistrationHandler, GenerateM2mTokenHandler, HospitalRegisterationHandler, InitiateEmailRegistrationHandler, LoginByEmailHandler, LoginByGoogleHandler, LoginByPhoneNumberHandler } from './application/commands/auth';
import { CreateServiceClientHandler } from './application/commands/auth/handlers/CreateServiceClient.command.handler';
import { GetAllUsersHandler, GetUserByIdHandler, GetUserByPhoneHandler } from './application/queries/users';
import { ServiceClient } from './domain/auth/entities/service-client.entity';
import { IServiceClientRepository } from './domain/auth/interfaces';
import { RefreshToken, User } from './domain/users/entities';
import { IRefreshTokenRepository } from './domain/users/interfaces';
import { IUserRepository } from './domain/users/interfaces/user.repository.interface';
import { ServiceClientRepository } from './infrastructure/auth/repositories';
import { ClientCredentialsStrategy } from './infrastructure/auth/strategies';
import { AccountTransactionService, AuthTransactionService, OtpService, TokenService } from './infrastructure/common/services';
import { RefreshTokenRepository } from './infrastructure/users/repositories';
import { UserRepository } from './infrastructure/users/repositories/user.repository';
import { AuthResolver } from './presentation/graphql/resolvers/auth/auth.resolver';
import { AuthController } from './presentation/http/controllers/auth';
import { UsersResolver } from './presentation';

export const CommandHandlers = [
  LoginByEmailHandler,
  LoginByGoogleHandler,
  LoginByPhoneNumberHandler,

  InitiateEmailRegistrationHandler,
  CompleteEmailRegistrationHandler,
  HospitalRegisterationHandler,

  CreateServiceClientHandler,
  GenerateM2mTokenHandler,

  GetUserByIdHandler,
  GetAllUsersHandler,
  GetUserByPhoneHandler,

  FcmTokenRegisterationHandler
];

export const Repositories = [
  { provide: IUserRepository, useClass: UserRepository },
  { provide: IServiceClientRepository, useClass: ServiceClientRepository },
  { provide: IRefreshTokenRepository, useClass: RefreshTokenRepository },
];
export const InfrastructureServices = [
  OtpService,
  TokenService,
  AuthTransactionService,
  AccountTransactionService
];
export const Resolvers = [
  AuthResolver,
  UsersResolver
];
export const Controllers = [
  AuthController
];
export const Strategies = [
  ClientCredentialsStrategy
];

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
        entities: [User, RefreshToken, OutboxEntity],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([User, RefreshToken], 'accountConnection'),

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
        entities: [ServiceClient, OutboxEntity],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([ServiceClient], 'authConnection'),

    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>('REDIS_HOST');
        const port = configService.get<number>('REDIS_PORT');

        const logger = new Logger('RedisCache');

        logger.log(`[Redis] Configuring Redis cache with host: ${host}, port: ${port}`);

        try {
          const cacheConfig = {
            store: redisStore,
            host,
            port,
          };
          logger.log(`[Redis] Redis cache configuration successfully prepared`);
          return cacheConfig;
        } catch (error) {
          logger.error(`[Redis] Failed to configure Redis cache: ${error.message}`, error.stack);
          throw error;
        }
      },
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d') },
      }),
    }),

    OutboxModule.forRoot('accountConnection'),
    OutboxModule.forRoot('authConnection'),
    MetricsModule,
    HospitalApiClientModule,
    TenantApiClientModule,
    AuthLibModule,

    CqrsModule,
  ],
  controllers: [
    ...Controllers,
  ],
  providers: [
    ...CommandHandlers,
    ...Repositories,
    ...InfrastructureServices,
    ...Resolvers,
    ...Strategies,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: 'GOOGLE_OAUTH2_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return new OAuth2Client({
          clientId: configService.get<string>('GOOGLE_CLIENT_ID'),
          clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
        });
      },
    },
  ],
  exports: [ConfigModule],
})
export class AccountServiceModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).forRoutes('*');
  }
}
