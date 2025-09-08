import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { UsersModule } from '../users/users.module';
import { TokenService } from './tokens.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken], 'accountConnection'),
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [TokenService],
  exports: [TokenService], 
})
export class TokensModule {}