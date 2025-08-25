import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('patient_identities')
export class PatientIdentity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column({ type: 'uuid', name: 'user_id', unique: true, comment: 'Liên kết với User ID từ Account Service' })
  userId: string;

  @Column({ name: 'full_name' })
  fullName: string;
  
  @Column({ type: 'date' })
  dob: string; // Date of Birth, định dạng YYYY-MM-DD

  @Column()
  gender: string; // "Nam", "Nữ", "Khác"

  @Column({ name: 'phone_number' })
  phoneNumber: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'id_card_number', unique: true, nullable: true, comment: 'Số CMND/CCCD' })
  idCardNumber?: string;

  @Column({ name: 'bhyt_number', unique: true, nullable: true, comment: 'Số thẻ Bảo hiểm Y tế' })
  bhytNumber?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}