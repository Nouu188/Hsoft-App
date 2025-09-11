import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class RequestPasswordResetInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

@InputType()
export class VerifyPasswordResetInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  otp: string;
}

@InputType()
export class ConfirmPasswordResetInput {
  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * Token này sẽ được trả về từ bước xác thực thành công,
   * để đảm bảo chỉ user đã xác thực mới có thể đổi mật khẩu.
   */
  @Field()
  @IsString()
  @IsNotEmpty()
  resetToken: string;

  @Field()
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  newPassword: string;
}