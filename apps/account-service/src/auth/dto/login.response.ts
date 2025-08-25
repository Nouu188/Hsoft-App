import { Role } from '@app/auth';
import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class UserResponseDto {
  @Field()
  id: string;

  @Field()
  hoten: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  mabn?: string;

  @Field({ nullable: true })
  sodienthoai?: string;

  @Field({ nullable: true })
  socmnd?: string;

  @Field({ nullable: true })
  diachi?: string;

  @Field({ nullable: true })
  namsinh?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field(() => [String], { nullable: true })
  fcmTokens?: string[];

  @Field(() => [String], { nullable: true })
  apn_tokens?: string[];

  @Field(() => [Role])   
  roles: Role[];
}
@ObjectType()
export class LoginResponse {
  @Field()
  accessToken: string;

  @Field(() => UserResponseDto)
  user: UserResponseDto;
}