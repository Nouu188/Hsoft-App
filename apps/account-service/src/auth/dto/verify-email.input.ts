import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsString, Length } from 'class-validator';

@InputType()
export class VerifyEmailInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @Length(4, 4, { message: 'OTP phải có 4 chữ số' })
  otp: string;
}