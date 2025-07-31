import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthApiClientService } from './auth-api-client.service';

@Module({
  imports: [
    HttpModule.register({
        timeout: 15000, 
    }),
  ],
  providers: [AuthApiClientService],
  exports: [AuthApiClientService],
})
export class AuthApiClientModule {}