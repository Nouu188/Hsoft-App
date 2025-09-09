import { Field, ObjectType } from '@nestjs/graphql';
import { UserPayload } from 'apps/account-service/src/users/dto/user.payload';
@ObjectType()
export class LoginResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserPayload)
  user: UserPayload;
}