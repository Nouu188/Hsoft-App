import { Field, ObjectType, ID, registerEnumType, Int } from '@nestjs/graphql';
import { AppointmentStatus, AppointmentType } from '../entities/appointment.entity';
import { DoctorObjectType } from '../../../../tenant-management-service/src/doctors/dto/doctor.object-type'; // <-- Import Doctor
import { ClinicObjectType } from 'apps/tenant-management-service/src/clinics/dto/clinic.object-type';

registerEnumType(AppointmentStatus, { name: 'AppointmentStatus' });
registerEnumType(AppointmentType, { name: 'AppointmentType' });

@ObjectType('Appointment')
export class AppointmentObjectType {
  @Field(() => ID)
  id: string;

  @Field(() => AppointmentType)
  appointmentType: AppointmentType;

  @Field()
  appointmentTime: Date;

  @Field(() => AppointmentStatus)
  status: AppointmentStatus;

  @Field(() => Int)
  queueNumber: number;

  // --- Thông tin người đặt ---
  @Field()
  patientName: string;

  @Field()
  patientPhone: string;

  @Field()
  patientGender: string;

  @Field()
  birthYear: number;

  @Field({ nullable: true })
  notes?: string;

  // --- Thông tin liên quan ---
  @Field(() => ClinicObjectType, { nullable: true }) 
  clinic?: ClinicObjectType;

  @Field(() => DoctorObjectType, { nullable: true })
  doctor?: DoctorObjectType;
}