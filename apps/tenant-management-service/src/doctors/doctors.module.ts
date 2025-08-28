import { ApiClientsModule } from '@app/api-clients';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorsResolver } from './doctors.resolver';
import { DoctorsService } from './doctors.service';
import { Doctor } from './entities/doctor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor], 'tenantConnection'),
    ApiClientsModule,
  ],
  providers: [DoctorsResolver, DoctorsService],
  exports: [DoctorsService],
})
export class DoctorsModule { }