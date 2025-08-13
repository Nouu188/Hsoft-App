// src/modules/doses/entities/dose.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-type-json';

export enum DoseStatus {
  UPCOMING = 'UPCOMING',
  PENDING = 'PENDING',
  TAKEN = 'TAKEN',
  SKIPPED = 'SKIPPED',
  MISSED = 'MISSED',
}

export interface MealRelation {
  type: 'BEFORE' | 'AFTER' | 'WITH';
  minutes?: number;
}

registerEnumType(DoseStatus, { name: 'DoseStatus' });

@ObjectType()
@Entity('doses')
export class Dose {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  external_id: string;

  @Field({ description: 'ID của y lệnh từ bệnh viện' })
  @Column()
  ylenh_id: string;

  @Field({ nullable: true, description: 'Số thứ tự thuốc trong y lệnh' })
  @Column({ nullable: true })
  ylenh_stt?: string;

  @Field(() => Date)
  @Column({ type: 'timestamptz' })
  due_at: Date;

  @Field()
  @Column({ type: 'timestamptz' })
  notify_at: Date;

  @Field(() => DoseStatus)
  @Column({ type: 'enum', enum: DoseStatus, default: DoseStatus.UPCOMING, })
  status: DoseStatus;
  
  @Field(() => ID, { description: 'ID của người dùng sở hữu liều uống này' })
  @Column()
  user_id: string;

  @Field({ nullable: true, description: 'Thời điểm người dùng nhấn nút đã uống' })
  @Column({ type: 'timestamptz', nullable: true })
  taken_at?: Date;

  @Field({ description: 'Tên thuốc được sao chép từ y lệnh' })
  @Column()
  medication_name: string;

  @Field({ nullable: true, description: 'Hướng dẫn liều dùng từ y lệnh' })
  @Column({ nullable: true })
  dosage_instructions?: string;

  @Field({ nullable: true, description: 'Hướng dẫn cách dùng từ y lệnh' })
  @Column({ nullable: true })
  usage_instructions?: string;

  @Column({
    type: 'varchar',
    name: 'skip_reason_category',
    nullable: true,
    comment: 'Lý do chính khi bỏ qua liều thuốc (ví dụ: FORGOT, SIDE_EFFECT).',
  })
  skipReasonCategory: string | null;

  @Column({
    type: 'text',
    name: 'skip_reason_detail',
    nullable: true,
    comment: 'Mô tả chi tiết lý do bỏ qua.',
  })
  skipReasonDetail: string | null;

  @Column({
    type: 'jsonb', // Sử dụng kiểu jsonb để lưu trữ object
    nullable: true, // Cho phép giá trị là null
    name: 'meal_relation',
  })
  @Field(() => GraphQLJSONObject, { nullable: true, description: 'Quan hệ với bữa ăn' }) // Cần import GraphQLJSONObject
  meal_relation?: MealRelation | null;
}