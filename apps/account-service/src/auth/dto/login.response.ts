import { Role } from '@app/auth';
import { ObjectType, Field } from '@nestjs/graphql';
import { UserPayload } from '../../users/dto/user.payload';
@ObjectType()
export class LoginResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserPayload)
  user: UserPayload;
}