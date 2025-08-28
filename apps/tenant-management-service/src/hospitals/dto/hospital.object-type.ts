import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType('HospitalObjectType')
export class HospitalObjectType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  externalCode: string;

  @Field()
  graphqlEndpoint: string;

  @Field()
  isActive: boolean;
}