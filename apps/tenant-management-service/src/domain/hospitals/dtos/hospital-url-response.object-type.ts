import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class HospitalUrlResponse {
  @Field(() => String)
  graphqlEndpoint: string;
}
