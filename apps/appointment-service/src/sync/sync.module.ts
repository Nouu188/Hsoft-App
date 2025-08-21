// apps/appointment-service/src/sync/sync.module.ts

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SyncService } from './sync.service';
import { ApiClientsModule } from '@app/api-clients';
import { ClinicsModule } from '../clinics/clinics.module';
import { DoctorsModule } from '../doctors/doctors.module';

@Module({
  imports: [
    // Kích hoạt khả năng chạy Cron Job
    ScheduleModule.forRoot(),
    
    // Cung cấp các API client (ví dụ: HospitalApiClientService)
    ApiClientsModule,
    
    // Cung cấp các service nghiệp vụ (ClinicsService, DoctorsService)
    ClinicsModule,
    DoctorsModule,
  ],
  // Cung cấp SyncService để NestJS có thể khởi tạo và chạy cron job
  providers: [SyncService],
})
export class SyncModule {}