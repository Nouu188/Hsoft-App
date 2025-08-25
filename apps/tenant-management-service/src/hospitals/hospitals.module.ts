import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hospital } from './entities/hospital.entity';
import { HospitalsService } from './hospitals.service';
import { HospitalsResolver } from './hospitals.resolver';
import { AuthLibModule } from '@app/auth';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Hospital ]),
    AuthLibModule,
  ],
  providers: [HospitalsResolver, HospitalsService],
  exports: [HospitalsService], 
})
export class HospitalsModule {}