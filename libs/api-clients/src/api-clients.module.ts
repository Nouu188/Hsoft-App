import { Module } from '@nestjs/common';
import { HospitalApiClientModule } from './hospital/hospital-api-client.module';
import { NotificationApiClientModule } from './notification/notification-api-client.module';
import { DoseApiClientModule } from './doses/dose-api-client.module';
import { AccountApiClientModule } from './account/account-api-client.module';
import { AuthApiClientModule } from './auth/auth-api-client.module';
import { ConfigModule } from '@nestjs/config';
import { TenantApiClientModule } from './tenant/tenant-api-client.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/api-clients/.env.local',
    }),
    HospitalApiClientModule,
    NotificationApiClientModule,
    DoseApiClientModule,
    AccountApiClientModule,
    AuthApiClientModule,
    TenantApiClientModule
  ],
  exports: [
    HospitalApiClientModule,
    NotificationApiClientModule,
    DoseApiClientModule,
    AccountApiClientModule,
    AuthApiClientModule,
    TenantApiClientModule,
    ConfigModule,
  ],
})
export class ApiClientsModule {}