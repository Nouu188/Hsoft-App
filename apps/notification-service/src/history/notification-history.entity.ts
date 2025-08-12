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

@Entity('notification_history')
export class NotificationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  user_id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  body: string;

  @Column('simple-array', { name: 'dose_ids', nullable: true })
  dose_ids: string[];

  @Column({
    type: 'varchar',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({
    type: 'varchar',
    enum: NotificationStatus,
    default: NotificationStatus.SENT,
  })
  status: NotificationStatus;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Dữ liệu ngữ cảnh để client điều hướng, ví dụ: { "doseId": "..." }',
  })
  payload: Record<string, any>;

  @Column({ type: 'timestamptz', name: 'sent_at', default: () => 'CURRENT_TIMESTAMP' })
  sentAt: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}