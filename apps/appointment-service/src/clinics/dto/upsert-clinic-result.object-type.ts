import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UpsertClinicResult {
  @Field(() => Int)
  created: number;

  @Field(() => Int)
  updated: number;

  @Field(() => Int)
  deactivated: number;
}
