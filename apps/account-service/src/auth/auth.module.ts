import { HospitalApiClientModule } from '@app/api-clients/hospital/hospital-api-client.module';
import { TenantApiClientModule } from '@app/api-clients/tenant/tenant-api-client.module';
import { AuthLibModule } from '@app/auth';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';
import { OutboxModule } from '@app/outbox';
import { CacheModule } from '@nestjs/cache-manager';
import { Logger, Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { OAuth2Client } from 'google-auth-library';
import { M2mModule } from '../m2m/m2m.module';
import { OtpModule } from '../otp/otp.module';
import { TokensModule } from '../tokens/tokens.module';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { UsersModule } from '../users/users.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { ServiceClient } from './entities/service-client.entity';
import { EmailAuthenticationProvider } from './strategies/authenticators/login/email-authentication.provider';
import { GoogleAuthenticationProvider } from './strategies/authenticators/login/google-authentication.provider';
import { PhoneNumberAuthenticationProvider } from './strategies/authenticators/login/phone-authentication.provider';
import { EmailRegistrationProvider } from './strategies/authenticators/registeration/email-registration.provider';
import { PasswordResetProvider } from './strategies/authenticators/registeration/password-reset.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceClient], 'authConnection'),
    TypeOrmModule.forFeature([RefreshToken], 'accountConnection'),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d') },
      }),
    }),
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
    OutboxModule.forRoot('authConnection'),
    forwardRef(() => UsersModule),
    ConfigModule,
    AppRabbitMQModule,
    AuthLibModule,
    HospitalApiClientModule,
    TenantApiClientModule,
    OtpModule,
    TokensModule,
    M2mModule
  ],
  providers: [
    AuthService,
    AuthResolver,
    EmailAuthenticationProvider,
    GoogleAuthenticationProvider,
    PhoneNumberAuthenticationProvider,
    EmailRegistrationProvider,
    PasswordResetProvider,
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
  exports: [
    AuthService,
  ],
})
export class AuthModule { }