import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('MembershipDose')
@Entity('membership_doses')
export class MembershipDose {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid', name: 'membership_id' })
  membershipId: string;

  @Field()
  @Column({ type: 'uuid', name: 'dose_id' })
  doseId: string;

  @Field({ nullable: true, description: 'Quan hệ với dose: OWNER, CAREGIVER' })
  @Column({ nullable: true })
  relation?: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
