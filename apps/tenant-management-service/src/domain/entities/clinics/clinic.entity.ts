import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from 'typeorm';
import { Hospital } from '../hospitals';
import { Doctor } from '../doctors';
@ObjectType('Clinic')
@Entity({ name: 'clinics' })
@Unique(['hospitalId', 'externalCode'])
export class Clinic {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ 
    unique: true, 
    name: 'external_code',
    comment: 'External department/clinic code from hospital system (makp)'
  })
  externalCode: string;

  @Field()
  @Column({ comment: 'Clinic display name' })
  name: string;

  @Field()
  @Column({ 
    default: true,
    name: 'is_active',
    comment: 'Flag to enable/disable clinic visibility without deleting'
  })
  isActive: boolean;

  @Field(() => Hospital)
  @ManyToOne(() => Hospital, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;

  @Field()
  @Column({ name: 'hospital_id' })
  hospitalId: string;

  @Field(() => [Doctor], { nullable: true })
  @OneToMany(() => Doctor, doctor => doctor.clinic)
  doctors: Doctor[];

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
