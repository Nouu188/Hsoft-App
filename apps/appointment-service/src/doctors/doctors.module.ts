import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorsService } from './doctors.service';
import { DoctorsResolver } from './doctors.resolver';
import { ApiClientsModule } from '@app/api-clients';
import { Clinic } from '../clinics/entities/clinic.entity'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, Clinic], 'appointmentConnection'), 
    ApiClientsModule,
  ],
  providers: [DoctorsResolver, DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule {}