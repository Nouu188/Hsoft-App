import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType('Hospital')
export class HospitalObjectType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field()
  graphqlEndpoint: string;

  @Field()
  isActive: boolean;
}