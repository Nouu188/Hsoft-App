import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SyncService } from './sync.service';
import { ApiClientsModule } from '@app/api-clients';
import { ClinicsModule } from '../clinics/clinics.module';
import { DoctorsModule } from '../doctors/doctors.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ApiClientsModule,
    ClinicsModule,
    DoctorsModule,
  ],
  providers: [SyncService],
})
export class SyncModule {}