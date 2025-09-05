import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('MembershipNotification')
@Entity('membership_notifications')
export class MembershipNotification {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid', name: 'membership_id' })
  membershipId: string;

  @Field()
  @Column({ type: 'uuid', name: 'notification_id' })
  notificationId: string;

  @Field({ defaultValue: false })
  @Column({ default: false, name: 'is_read' })
  isRead: boolean;

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
