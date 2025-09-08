import { GraphQLJSONObject } from '@app/common/graphql/json.scalar';
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  DOSE_REMINDER = 'DOSE_REMINDER',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  RESULT_AVAILABLE = 'RESULT_AVAILABLE',
  PAYMENT_DUE = 'PAYMENT_DUE',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  GENERAL_ANNOUNCEMENT = 'GENERAL_ANNOUNCEMENT',
}

export enum NotificationStatus {
  SENT = 'SENT',
  READ = 'READ',          
  FAILED = 'FAILED',
}

registerEnumType(NotificationType, {
  name: 'NotificationType', 
  description: 'Các loại thông báo',
});

registerEnumType(NotificationStatus, {
  name: 'NotificationStatus',
  description: 'Trạng thái của một thông báo.',
});

@ObjectType('NotificationHistory')
@Entity('notification_history')
export class NotificationHistory {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Field()
  @Column()
  title: string;

  @Field()
  @Column({ type: 'text' })
  body: string;

  @Field(() => [String], { nullable: true })
  @Column('simple-array', { name: 'dose_ids', nullable: true })
  doseIds: string[];

  @Field(() => NotificationType)
  @Column({ type: 'varchar', enum: NotificationType })
  type: NotificationType;

  @Field(() => NotificationStatus)
  @Column({ type: 'varchar', enum: NotificationStatus })
  status: NotificationStatus;

  @Field(() => GraphQLJSONObject, { nullable: true }) 
  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  @Field()
  @Column({ type: 'timestamptz', name: 'sent_at' })
  sentAt: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}