import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic } from './entities/clinic.entity';
import { ClinicsService } from './clinics.service';
import { ClinicsResolver } from './clinics.resolver';
import { HospitalApiClientModule } from '@app/api-clients/hospital/hospital-api-client.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Clinic], 'tenantConnection'),
        HospitalApiClientModule
    ],
    providers: [ClinicsResolver, ClinicsService],
    exports: [ClinicsService],
})
export class ClinicsModule { }