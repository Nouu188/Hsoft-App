import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('MembershipHospital')
@Entity('membership_hospitals')
export class MembershipHospital {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid', name: 'membership_id' })
  membershipId: string; // FK tới Membership

  @Field()
  @Column({ type: 'uuid', name: 'hospital_id' })
  hospitalId: string; // từ hospital-service

  @Field({ nullable: true, description: 'Vai trò trong hospital này (PATIENT, DOCTOR, STAFF)' })
  @Column({ nullable: true })
  hospitalRole?: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
