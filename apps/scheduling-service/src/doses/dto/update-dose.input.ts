import { InputType, Field, ID } from '@nestjs/graphql';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator';
import { DoseStatus } from '../entities/dose.entity';
import { Type } from 'class-transformer';

@InputType()
class MealRelationInput {
  @Field()
  @IsEnum(['BEFORE', 'AFTER', 'WITH'])
  type: 'BEFORE' | 'AFTER' | 'WITH';

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  minutes?: number;
}

@InputType()
export class UpdateDoseDataInput {
  @Field(() => DoseStatus, { nullable: true, description: 'Trạng thái mới của liều uống' })
  @IsOptional()
  @IsEnum(DoseStatus)
  status?: DoseStatus;

  @Field(() => String, { nullable: true, description: 'Thời gian uống thuốc mới (định dạng ISO 8601)' })
  @IsOptional()
  @IsDateString() // Validate rằng đây là một chuỗi ngày tháng hợp lệ
  due_at?: string

  @Field(() => MealRelationInput, { nullable: true, description: 'Cài đặt quan hệ với bữa ăn' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MealRelationInput)
  meal_relation?: MealRelationInput | null;
}

@InputType()
export class UpdateDoseInput {
  @Field(() => ID, { description: 'ID của liều uống cần cập nhật' })
  @IsUUID()
  id: string;

  @Field(() => UpdateDoseDataInput, { description: 'Dữ liệu cần cập nhật' })
  data: UpdateDoseDataInput;
}