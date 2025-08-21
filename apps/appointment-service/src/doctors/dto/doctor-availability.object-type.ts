import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('TimeSlot')
export class TimeSlot {
  @Field(() => Date)
  startTime: Date;

  @Field(() => Date)
  endTime: Date;

  @Field()
  isAvailable: boolean;
}

@ObjectType('DoctorAvailability')
export class DoctorAvailability {
  @Field()
  date: string; // YYYY-MM-DD

  @Field(() => [TimeSlot])
  timeSlots: TimeSlot[];
}