// apps/patient-identity-service/src/identities/dto/create-or-update-identity.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

@InputType()
export class CreateOrUpdateIdentityInput {
  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @Field()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Ngày sinh phải có định dạng YYYY-MM-DD' })
  dob: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Giới tính không được để trống' })
  gender: string;

  @Field()
  @IsString()
  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  phoneNumber: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @Length(9, 12, { message: 'Số CMND/CCCD phải có từ 9 đến 12 ký tự' })
  idCardNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bhytNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  address?: string;
}