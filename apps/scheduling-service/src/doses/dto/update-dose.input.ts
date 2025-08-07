import { InputType, Field, ID } from '@nestjs/graphql';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { DoseStatus } from '../entities/dose.entity';

@InputType()
export class UpdateDoseDataInput {
  @Field(() => DoseStatus, { nullable: true, description: 'Trạng thái mới của liều uống' })
  @IsOptional()
  @IsEnum(DoseStatus)
  status?: DoseStatus;
}

@InputType()
export class UpdateDoseInput {
  @Field(() => ID, { description: 'ID của liều uống cần cập nhật' })
  @IsUUID()
  id: string;

  @Field(() => UpdateDoseDataInput, { description: 'Dữ liệu cần cập nhật' })
  data: UpdateDoseDataInput;
}