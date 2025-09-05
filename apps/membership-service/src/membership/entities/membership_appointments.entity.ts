import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('MembershipAppointment')
@Entity('membership_appointments')
export class MembershipAppointment {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid', name: 'membership_id' })
  membershipId: string;

  @Field()
  @Column({ type: 'uuid', name: 'appointment_id' })
  appointmentId: string;

  @Field()
  @Column({ default: true })
  isOwner: boolean; // true nếu chính membership tạo appointment

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
