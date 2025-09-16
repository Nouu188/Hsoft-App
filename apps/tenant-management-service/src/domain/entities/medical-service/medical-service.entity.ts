import { GraphQLJSONObject } from '@app/common/graphql/json.scalar';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@ObjectType('MedicalServicePrice')
export class MedicalServicePrice {
  @Field(() => Float, { description: 'Giá thu phí' })
  regular: number;

  @Field(() => Float, { description: 'Giá BHYT' })
  healthInsurance: number;

  @Field(() => Float, { description: 'Giá dịch vụ' })
  service: number;

  @Field(() => Float, { description: 'Giá cho người nước ngoài' })
  foreigner: number;
}

@ObjectType('MedicalService')
@Entity({ name: 'medical_services' })
export class MedicalService {
  @Field(() => ID)
  @PrimaryColumn({ 
    comment: 'Mã dịch vụ từ hệ thống bệnh viện (mavp)' 
  })
  id: string;

  @Field()
  @Column({ comment: 'Tên dịch vụ (tenvp)' })
  name: string;

  @Field(() => MedicalServicePrice, { description: 'Các mức giá của dịch vụ' })
  @Column({ 
    type: 'jsonb', 
    comment: 'Lưu trữ các loại giá khác nhau của dịch vụ' 
  })
  prices: MedicalServicePrice;

  @Field({ description: 'Áp dụng BHYT hay không' })
  @Column({ name: 'is_health_insurance_applied', default: false })
  isHealthInsuranceApplied: boolean;

  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Dữ liệu gốc từ bệnh viện' })
  @Column({ type: 'jsonb', nullable: true, name: 'raw_data' })
  rawData?: Record<string, any>;
  
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}