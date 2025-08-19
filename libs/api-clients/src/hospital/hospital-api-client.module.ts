import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HospitalApiClientService } from './hospital-api.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.register({
      timeout: 15000,
    }),
    ConfigModule,
  ],
  providers: [HospitalApiClientService],
  exports: [HospitalApiClientService], 
})
export class HospitalApiClientModule {}