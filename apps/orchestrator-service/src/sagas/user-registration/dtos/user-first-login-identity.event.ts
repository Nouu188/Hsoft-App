import { Gender } from 'apps/tenant-management-service/src/identities/entities/identity.entity';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

class IdentityPayloadDto {
  @IsString({ message: 'Họ và tên phải là một chuỗi' })
  @IsNotEmpty({ message: 'Họ và tên không được để trống' })
  fullName: string;

  @IsOptional()
  @IsString()
  externalPatientCode?: string;

  @IsOptional()
  @IsEnum(Gender, { message: 'Giới tính không hợp lệ' })
  gender?: Gender;

  @IsOptional()
  @IsString()
  healthInsuranceNumber?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL không hợp lệ' })
  avatarUrl?: string;

  @IsOptional()
  @IsInt({ message: 'Năm sinh phải là một số nguyên' })
  @Min(1900, { message: 'Năm sinh không hợp lệ' })
  @Max(new Date().getFullYear(), { message: 'Năm sinh không hợp lệ' })
  birthYear?: number;
}

export class UserFirstLoginIdentityEvent {
  @IsUUID('4', { message: 'userId phải là một UUID hợp lệ' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã bệnh viện không được để trống' })
  externalHospitalCode: string;

  @ValidateNested()
  @Type(() => IdentityPayloadDto)
  identity: IdentityPayloadDto;
}