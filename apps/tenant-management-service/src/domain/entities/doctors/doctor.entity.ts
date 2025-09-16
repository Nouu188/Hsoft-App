import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Clinic } from '../clinics';
import { Gender } from '../identities';
import { MedicalService } from '../medical-service';

// Di chuyển Gender enum ra một file chung để tái sử dụng
// registerEnumType(Gender, { name: 'Gender' }); 

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
    comment: 'Mã bác sĩ từ hệ thống bệnh viện (ma)'
  })
  externalCode: string;

  @Field()
  @Column({ comment: 'Họ và tên bác sĩ (hoten)' })
  name: string;

  @Field(() => Gender, { nullable: true })
  @Column({ type: 'enum', enum: Gender, nullable: true, comment: 'Giới tính (phai)' })
  gender?: Gender;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, comment: 'Kinh nghiệm hoặc chuyên khoa (kinhnghiem)' })
  experience?: string;

  @Field({ nullable: true })
  @Column({ type: 'text', nullable: true, comment: 'Thông báo chung của phòng khám (thongbao)' })
  announcement?: string;

  @Field({ nullable: true })
  @Column({ name: 'pin_code', nullable: true, comment: 'Mã PIN nếu có (pin)' })
  pinCode?: string;

  @Field()
  @Column({
    default: true,
    name: 'is_active',
    comment: 'Flag để bật/tắt bác sĩ trong app'
  })
  isActive: boolean;

  @Field(() => Clinic)
  @ManyToOne(() => Clinic, clinic => clinic.doctors, { onDelete: 'SET NULL' }) // Đổi thành SET NULL
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Field()
  @Column({ name: 'clinic_id' })
  clinicId: string;

  @Field(() => [MedicalService], { description: 'Các dịch vụ khám mà bác sĩ này cung cấp' })
  @ManyToMany(() => MedicalService, { cascade: true, eager: true }) // eager: true để tự động load
  @JoinTable({
    name: 'doctor_services',
    joinColumn: { name: 'doctor_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'service_id', referencedColumnName: 'id' },
  })
  services: MedicalService[];

  @Field()
  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;

  @Field({ nullable: true })
  @Column({ name: 'avatar_url', nullable: true, comment: 'URL ảnh đại diện (hinhanh)' })
  avatarUrl?: string;
}