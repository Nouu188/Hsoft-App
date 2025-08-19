import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthApiClientService } from './auth-api-client.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.register({
        timeout: 15000, 
    }),
    ConfigModule,
  ],
  providers: [AuthApiClientService],
  exports: [AuthApiClientService],
})
export class AuthApiClientModule {}