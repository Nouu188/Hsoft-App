import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsResolver } from './appointments.resolver';
import { AppRabbitMQModule } from '@app/common/rabbitmq';
import { AccountApiClientModule } from '@app/api-clients/account/account-api-client.module';
import { TenantApiClientModule } from '@app/api-clients/tenant/tenant-api-client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Appointment ], 'appointmentConnection'),
    AppRabbitMQModule,
    AccountApiClientModule,
    TenantApiClientModule,
  ],
  providers: [AppointmentsResolver, AppointmentsService],
})
export class AppointmentsModule {}