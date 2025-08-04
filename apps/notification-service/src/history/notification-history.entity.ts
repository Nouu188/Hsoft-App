import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notification_history')
export class NotificationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  title: string;

  @Column('text')
  body: string;

  @Column('text', { array: true })
  dose_ids: string[];

  @CreateDateColumn()
  sent_at: Date;
}