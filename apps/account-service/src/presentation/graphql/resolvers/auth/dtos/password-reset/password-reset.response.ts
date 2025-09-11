import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RequestPasswordResetResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@ObjectType()
export class VerifyPasswordResetResponse {
  @Field()
  success: boolean;
  
  @Field({ description: 'Token tạm thời để xác nhận mật khẩu mới' })
  resetToken: string;
}