import { Module } from '@nestjs/common';
import { HospitalApiClientModule } from './hospital/hospital-api-client.module';
import { NotificationApiClientModule } from './notification/notification-api-client.module';
import { DoseApiClientModule } from './doses/dose-api-client.module';
import { AccountApiClientModule } from './account/account-api-client.module';
import { AuthApiClientModule } from './auth/auth-api-client.module';

@Module({
  imports: [
    HospitalApiClientModule,
    NotificationApiClientModule,
    DoseApiClientModule,
    AccountApiClientModule,
    AuthApiClientModule
  ],
  exports: [
    HospitalApiClientModule,
    NotificationApiClientModule,
    DoseApiClientModule,
    AccountApiClientModule,
    AuthApiClientModule
  ],
})
export class ApiClientsModule {}