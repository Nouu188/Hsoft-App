import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { M2mResolver } from './m2m.resolver';
import { M2mService } from './m2m.service';
import { ServiceClient } from '../auth/entities/service-client.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ ServiceClient ], 'authConnection'),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  providers: [M2mService, M2mResolver],
  exports: [M2mService], 
})
export class M2mModule {}