import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('MembershipDoctor')
@Entity('membership_doctors')
export class MembershipDoctor {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid', name: 'membership_id' })
  membershipId: string;

  @Field()
  @Column({ type: 'uuid', name: 'doctor_id' })
  doctorId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  specialization?: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
