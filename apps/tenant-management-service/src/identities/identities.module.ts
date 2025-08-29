import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Identity } from './entities/identity.entity';
import { IdentitiesResolver } from './identities.resolver';
import { IdentitiesService } from './services/identities.service';
import { AppRabbitMQModule } from '@app/common/rabbitmq';
import { IdentityCreatedConsumer } from './jobs/consumers/identity-created.consumer';
import { AuthLibModule } from '@app/auth';
import { HospitalsModule } from '../hospitals/hospitals.module';
import { HospitalApiClientModule } from '@app/api-clients/hospital/hospital-api-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Identity ], 'tenantConnection'),
    AuthLibModule,
    AppRabbitMQModule,
    HospitalsModule,
    HospitalApiClientModule
  ],
  providers: [
    IdentitiesResolver, 
    IdentitiesService, 
    IdentityCreatedConsumer
  ],
  exports: [IdentitiesService],
})
export class IdentitiesModule {}