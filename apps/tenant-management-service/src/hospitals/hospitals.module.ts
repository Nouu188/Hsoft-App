import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hospital } from './entities/hospital.entity';
import { HospitalsService } from './hospitals.service';
import { HospitalsResolver } from './hospitals.resolver';
import { AuthLibModule } from '@app/auth';
import { AccountApiClientModule } from '@app/api-clients/account/account-api-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Hospital ], 'tenantConnection'),
    AuthLibModule,
    AccountApiClientModule
  ],
  providers: [HospitalsResolver, HospitalsService],
  exports: [HospitalsService], 
})
export class HospitalsModule {}