import { forwardRef, Module } from '@nestjs/common';
import { AuthResolver } from './auth.resolver';
import { UsersModule } from '../../../apps/account-service/src/users/users.module';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { HospitalModule } from 'apps/scheduling-service/src/hospital/hospital.module';
import { ClientCredentialsStrategy } from './strategies/client-credentials.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { M2MJwtStrategy } from './strategies/m2m-jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceClient } from './entities/service-client.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

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
    ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: './libs/auth/.env.local',
    }),
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
        entities: [ ServiceClient ], 
        synchronize: true,
      }),
    }),  
    TypeOrmModule.forFeature([ServiceClient]),
    HospitalModule,
  ],
  exports: [
    AuthService
  ]
})
export class AuthLibModule {}
