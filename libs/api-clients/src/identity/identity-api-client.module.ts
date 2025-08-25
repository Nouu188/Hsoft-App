import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PatientIdentityApiClientService } from './identity-api-client.service';
import { AuthApiClientModule } from '../auth/auth-api-client.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule,
    AuthApiClientModule,
  ],
  providers: [PatientIdentityApiClientService],
  exports: [PatientIdentityApiClientService],
})
export class PatientIdentityApiClientModule {}