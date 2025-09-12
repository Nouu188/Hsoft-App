import { InputType, Field } from '@nestjs/graphql';
import { Gender, Hospital } from '../../entities';

@InputType()
export class CreateIdentityInput {
  @Field({ description: 'Họ và tên đầy đủ' })
  fullName: string;

  @Field({ nullable: true, description: 'Mã bệnh nhân chính' })
  externalPatientCode?: string;

  @Field(() => Gender, { nullable: true, description: 'Giới tính' })
  gender?: Gender;

  @Field({ nullable: true, description: 'Số thẻ BHYT' })
  healthInsuranceNumber?: string;

  @Field({ nullable: true, description: 'Số điện thoại' })
  phoneNumber?: string;

  @Field({ nullable: true, description: 'Số CMND/CCCD' })
  nationalId?: string;

  @Field({ nullable: true, description: 'Địa chỉ liên hệ' })
  address?: string;

  @Field({ nullable: true, description: 'Ảnh đại diện' })
  avatarUrl?: string;

  @Field({ nullable: true, description: 'Năm sinh' })
  birthYear?: number;

  @Field(() => [Hospital], { nullable: true, description: 'Danh sách bệnh viện liên kết' })
  hospitals: Hospital[];
}
