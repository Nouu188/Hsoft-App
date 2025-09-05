import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('MembershipClinic')
@Entity('membership_clinics')
export class MembershipClinic {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid', name: 'membership_id' })
  membershipId: string;

  @Field()
  @Column({ type: 'uuid', name: 'clinic_id' })
  clinicId: string;

  @Field({ nullable: true, description: 'Vai trò tại clinic (DOCTOR, PATIENT, NURSE)' })
  @Column({ nullable: true })
  clinicRole?: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
