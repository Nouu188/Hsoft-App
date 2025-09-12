import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Hospital } from '../hospitals';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}
registerEnumType(Gender, { name: 'Gender' });

@ObjectType('Identity')
@Entity('identities')
export class Identity {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ description: 'ID của user liên kết' })
  @Column({ type: 'varchar', unique: true })
  userId: string;

  @Field({ description: 'Họ và tên đầy đủ' })
  @Column({ name: 'full_name' })
  fullName: string;

  @Field({ nullable: true, description: 'Mã bệnh nhân chính' })
  @Column({ type: 'varchar', unique: true, nullable: true, name: 'external_patient_code' })
  externalPatientCode?: string;

  @Field(() => Gender, { nullable: true })
  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender?: Gender;
  
  @Field({ nullable: true, description: 'Số thẻ BHYT' })
  @Column({ name: 'health_insurance_number', unique: true, nullable: true })
  healthInsuranceNumber?: string;

  @Field({ nullable: true, description: 'Số điện thoại' })
  @Column({ unique: true, nullable: true, name: 'phone_number' })
  phoneNumber?: string;

  @Field({ nullable: true, description: 'Số CMND/CCCD' })
  @Column({ unique: true, nullable: true, name: 'national_id' })
  nationalId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true, description: 'Năm sinh' })
  @Column({ type: 'int', nullable: true, name: 'birth_year' })
  birthYear?: number;

  @Field(() => [Hospital], { nullable: true })
  @ManyToMany(() => Hospital, { cascade: true })
  @JoinTable({
    name: 'identity_hospitals', // tên bảng trung gian
    joinColumn: { name: 'identity_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'hospital_id', referencedColumnName: 'id' },
  })
  hospitals?: Hospital[];
  
  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}