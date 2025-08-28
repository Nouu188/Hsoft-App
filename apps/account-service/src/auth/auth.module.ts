import { AuthLibModule } from '@app/auth';
import { Logger, Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { join } from 'path';
import { UsersModule } from '../users/users.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { AuthController } from './controllers/auth.controller';
import { ServiceClient } from './entities/service-client.entity';
import { ClientCredentialsStrategy } from './strategies/client-credentials.strategy';
import { GoogleModule } from './strategies/google/google.module';
import { HospitalApiClientModule } from '@app/api-clients/hospital/hospital-api-client.module';
import { TenantApiClientModule } from '@app/api-clients/tenant/tenant-api-client.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceClient], 'authConnection'),
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
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          port: configService.get<number>('SMTP_PORT'),
          secure: false,
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: `"MedPlusApp" <${configService.get<string>('SMTP_FROM')}>`,
        },
        template: {
          dir: join(process.cwd(), 'apps/account-service/src/auth/templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    forwardRef(() => UsersModule),
    ConfigModule,
    AppRabbitMQModule,
    AuthLibModule,
    GoogleModule,
    HospitalApiClientModule,
    TenantApiClientModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthResolver,
    ClientCredentialsStrategy,
  ],
  exports: [
    AuthService,
  ],
})
export class AuthModule { }