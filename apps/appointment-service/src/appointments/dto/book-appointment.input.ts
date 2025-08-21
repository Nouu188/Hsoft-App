// apps/appointment-service/src/appointments/dto/book-appointment.input.ts

import { InputType, Field, ID } from '@nestjs/graphql';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, Matches } from 'class-validator';

@InputType()
export class BookByClinicInput {
  @Field(() => ID)
  @IsUUID()
  clinicId: string;

  @Field()
  @IsDateString()
  appointmentTime: string; // Chuỗi ISO 8601, ví dụ: "2025-08-20T08:30:00.000Z"

  @Field()
  @IsString()
  @IsNotEmpty()
  patientName: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  patientPhone: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  patientGender: string; // Ví dụ: "Nam", "Nữ", "Khác"

  @Field()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Ngày sinh phải có định dạng YYYY-MM-DD' })
  patientDob: string; // Định dạng YYYY-MM-DD

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}