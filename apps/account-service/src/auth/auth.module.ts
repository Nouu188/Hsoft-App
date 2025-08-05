import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthLibModule } from '@app/auth'; 

import { UsersModule } from '../users/users.module';
import { ServiceClient } from './entities/service-client.entity';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { AuthController } from './controllers/auth.controller';
import { ClientCredentialsStrategy } from './strategies/client-credentials.strategy';
import { AppRabbitMQModule } from '@app/common/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([ ServiceClient ], 'authConnection'),
    AuthLibModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d') },
      }),
    }),
    AppRabbitMQModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthResolver,
    ClientCredentialsStrategy,
  ],
})
export class AuthModule {}