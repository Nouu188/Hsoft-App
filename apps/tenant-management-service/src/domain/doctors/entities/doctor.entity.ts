import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Clinic } from '../../clinics/entities/clinic.entity';

@ObjectType('Doctor')
@Entity({ name: 'doctors' })
export class Doctor {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ 
    unique: true, 
    name: 'external_code',
    comment: 'External doctor code from hospital system (mabs)'
  })
  externalCode: string;

  @Field()
  @Column({ comment: 'Doctor full name' })
  name: string;

  @Field({ nullable: true })
  @Column({ name: 'avatar_url', nullable: true, comment: 'Profile picture URL of the doctor' })
  avatarUrl?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, comment: 'Short biography or description of the doctor' })
  bio?: string;

  @Field()
  @Column({ 
    default: true,
    name: 'is_active',
    comment: 'Flag to enable/disable doctor visibility in app'
  })
  isActive: boolean;

  @Field(() => Clinic)
  @ManyToOne(() => Clinic, clinic => clinic.doctors, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Field()
  @Column({ name: 'clinic_id' })
  clinicId: string;

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
