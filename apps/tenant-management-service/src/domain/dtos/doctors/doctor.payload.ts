import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Gender } from '../../entities';

@ObjectType('DoctorServicePricePayload')
class DoctorServicePricePayload {
  @Field(() => Float)
  regular: number;

  @Field(() => Float)
  healthInsurance: number;
}

@ObjectType('DoctorServicePayload')
class DoctorServicePayload {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => DoctorServicePricePayload)
  prices: DoctorServicePricePayload;

  @Field()
  isHealthInsuranceApplied: boolean;
}

@ObjectType('DoctorPayload')
export class DoctorPayload {
  @Field(() => ID)
  externalCode: string;

  @Field()
  name: string;

  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  experience?: string;

  @Field({ nullable: true })
  announcement?: string;

  @Field()
  externalClinicCode: string;

  @Field(() => [DoctorServicePayload])
  services: DoctorServicePayload[];
}