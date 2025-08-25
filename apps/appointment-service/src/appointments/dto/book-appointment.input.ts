import { Field, ID, InputType } from '@nestjs/graphql';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType()
export abstract class BaseBookAppointmentInput {
  @Field(() => ID)
  @IsUUID()
  hospitalId: string;

  @Field()
  @IsDateString()
  appointmentTime: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class BookByClinicInput extends BaseBookAppointmentInput {
  @Field(() => ID)
  @IsUUID()
  clinicId: string;
}

@InputType()
export class BookByDoctorInput extends BaseBookAppointmentInput {
  @Field(() => ID)
  @IsUUID()
  doctorId: string;
}