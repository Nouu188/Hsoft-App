import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @Matches(/^[0-9]{9,11}$/, { message: 'Số điện thoại không hợp lệ' })
  phoneNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  googleId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @MinLength(6, { message: 'Mật khẩu tối thiểu 6 ký tự' })
  @MaxLength(32, { message: 'Mật khẩu tối đa 32 ký tự' })
  password?: string;
}
