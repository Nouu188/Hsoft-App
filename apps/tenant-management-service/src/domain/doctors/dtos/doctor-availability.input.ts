import { Field, InputType, ID } from '@nestjs/graphql';
import { Matches } from 'class-validator';

@InputType()
export class DoctorAvailabilityInput {
  @Field(() => ID)
  doctorId: string;

  @Field()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Ngày phải có định dạng YYYY-MM-DD' })
  date: string;
}
