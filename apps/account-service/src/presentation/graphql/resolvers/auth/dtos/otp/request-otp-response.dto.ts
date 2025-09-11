import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RequestOtpResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
