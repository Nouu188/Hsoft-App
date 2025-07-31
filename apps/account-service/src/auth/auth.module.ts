import { forwardRef, Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { HospitalModule } from 'apps/scheduling-service/src/hospital/hospital.module';
import { AuthController } from './auth.controller';
import { ClientCredentialsStrategy } from './strategies/client-credentials.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { M2MJwtStrategy } from './strategies/m2m-jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceClient } from './entities/service-client.entity';

@Module({
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    ClientCredentialsStrategy,
    M2MJwtStrategy,
  ],
  controllers: [
    AuthController
  ],
  imports: [
    HttpModule,
    forwardRef(() => UsersModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
    TypeOrmModule.forFeature([ ServiceClient ]),
    HospitalModule,
  ],
  exports: [
    AuthService
  ]
})
export class AuthModule {}
