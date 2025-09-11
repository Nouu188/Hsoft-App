import { Field, ObjectType } from "@nestjs/graphql";
import { Gender } from "apps/tenant-management-service/src/domain/identities/entities";

@ObjectType('IdentityFromHospital')
export class IdentityFromHospitalDto {
  @Field({ nullable: true, description: 'Mã bệnh nhân từ HIS' })
  externalPatientCode?: string;

  @Field({ nullable: true, description: 'Số điện thoại bệnh nhân' })
  phoneNumber?: string;

  @Field({ nullable: true, description: 'Họ và tên đầy đủ' })
  fullName?: string;

  @Field({ nullable: true, description: 'Số CMND/CCCD' })
  nationalId?: string;

  @Field({ nullable: true, description: 'Năm sinh (yyyy)' })
  birthYear?: number;

  @Field(() => Gender, { nullable: true, description: 'Giới tính chuẩn hóa' })
  gender?: Gender;

  @Field({ nullable: true, description: 'Số thẻ BHYT' })
  healthInsuranceNumber?: string;

  @Field({ nullable: true, description: 'Địa chỉ' })
  address?: string;

  @Field({ nullable: true, description: 'Ảnh đại diện bệnh nhân' })
  avatarUrl?: string;
}