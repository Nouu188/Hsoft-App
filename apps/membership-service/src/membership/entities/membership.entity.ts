import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Membership')
@Entity('memberships')
export class Membership {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'uuid', name: 'user_id' })
  userId: string; 

  @Field()
  @Column({ type: 'uuid', name: 'identity_id' })
  identityId: string; 

  @Field({ nullable: true, defaultValue: 'PATIENT', description: 'Vai trò trong hospital/tenant (PATIENT, DOCTOR, STAFF, ADMIN)' })
  @Column({ nullable: true })
  role?: string;

  @Field({ description: 'Cờ active/inactive cho membership' })
  @Column({ default: true })
  isActive: boolean;

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
