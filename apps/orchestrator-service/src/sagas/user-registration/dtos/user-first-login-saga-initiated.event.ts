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

/**
 * Định nghĩa Enum Gender để sử dụng nhất quán giữa các service.
 * Tốt nhất là Enum này nên được đặt trong một thư viện chung (ví dụ: libs/common/enums)
 * để cả entity và DTO đều có thể import từ một nguồn duy nhất.
 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

/**
 * IdentityPayloadDto định nghĩa cấu trúc dữ liệu định danh của người dùng
 * được gửi đi trong event. Nó ánh xạ chặt chẽ với các trường có trong
 * entity 'Identity' nhưng chỉ chứa những thông tin cần thiết cho việc truyền tải.
 */
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
  // Cân nhắc dùng @IsPhoneNumber('VN') nếu muốn validation chặt chẽ hơn
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

export class UserFirstLoginSagaInitiatedEvent {
  @IsUUID('4', { message: 'userId phải là một UUID hợp lệ' })
  userId: string;

  @IsString()
  @IsNotEmpty({ message: 'Mã bệnh viện không được để trống' })
  externalHospitalCode: string;

  @IsUrl({}, { message: 'URL bệnh viện không hợp lệ' })
  @IsNotEmpty({ message: 'URL bệnh viện không được để trống' })
  hospitalUrl: string;

  @ValidateNested()
  @Type(() => IdentityPayloadDto)
  identity: IdentityPayloadDto;
}