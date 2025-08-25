import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType('PatientIdentity')
export class PatientIdentityObjectType {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;
  
  @Field()
  fullName: string;

  @Field()
  dob: string;

  @Field()
  gender: string;

  @Field()
  phoneNumber: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  idCardNumber?: string;

  @Field({ nullable: true })
  bhytNumber?: string;

  @Field({ nullable: true })
  address?: string;
}