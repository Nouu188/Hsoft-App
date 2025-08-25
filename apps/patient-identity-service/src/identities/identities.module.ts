import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientIdentity } from './entities/patient-identity.entity';
import { IdentitiesService } from './identities.service';
import { IdentitiesResolver } from './identities.resolver';
import { AuthLibModule } from '@app/auth';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientIdentity]),
    AuthLibModule,
  ],
  providers: [IdentitiesResolver, IdentitiesService],
  exports: [IdentitiesService],
})
export class IdentitiesModule {}