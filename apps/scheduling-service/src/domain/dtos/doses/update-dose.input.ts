import { InputType, Field, ID } from '@nestjs/graphql';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, ValidateNested } from 'class-validator';
import { DoseStatus } from '../../entities/doses/dose.entity';
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
  @IsDateString()
  due_at?: Date

  @Field(() => MealRelationInput, { nullable: true, description: 'Cài đặt quan hệ với bữa ăn' })
  @IsOptional()
  @ValidateNested()
  @Type(() => MealRelationInput)
  meal_relation?: MealRelationInput | null;

  @Field(() => String, { nullable: true, description: 'Lý do chính khi bỏ qua liều thuốc' })
  @IsOptional()
  @IsString()
  skipReasonCategory?: string;

  @Field(() => String, { nullable: true, description: 'Mô tả chi tiết lý do bỏ qua' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  skipReasonDetail?: string;
}

@InputType()
export class UpdateDoseInput {
  @Field(() => ID, { description: 'ID của liều uống cần cập nhật' })
  @IsUUID()
  id: string;

  @Field(() => UpdateDoseDataInput, { description: 'Dữ liệu cần cập nhật' })
  @ValidateNested()
  @Type(() => UpdateDoseDataInput)
  data: UpdateDoseDataInput;
}