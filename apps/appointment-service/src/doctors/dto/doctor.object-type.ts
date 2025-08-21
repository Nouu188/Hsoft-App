import { Field, ObjectType, ID } from '@nestjs/graphql';
import { ClinicObjectType } from '../../clinics/dto/clinic.object-type';

@ObjectType('Doctor')
export class DoctorObjectType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => [ClinicObjectType], { description: 'Phòng khám nơi bác sĩ làm việc' })
  clinic: [ClinicObjectType];
}