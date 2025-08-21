import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsResolver } from './appointments.resolver';
import { AppRabbitMQModule } from '@app/common/rabbitmq';
import { ClinicsModule } from '../clinics/clinics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Appointment ], 'appointmentConnection'),
    AppRabbitMQModule,
    ClinicsModule,
  ],
  providers: [AppointmentsResolver, AppointmentsService],
})
export class AppointmentsModule {}