import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { Clinic } from '../../clinics/entities/clinic.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    unique: true, 
    name: 'external_mabs',
    comment: 'Mã bác sĩ từ hệ thống bệnh viện'
  })
  externalMabs: string;

  @Column()
  name: string;

  @Column({ name: 'avatar_url', nullable: true, comment: 'URL ảnh đại diện của bác sĩ' })
  avatarUrl: string;

  @Column({ type: 'text', nullable: true, comment: 'Tiểu sử ngắn hoặc mô tả về bác sĩ' })
  bio: string;

  @Column({ 
    default: true,
    name: 'is_active',
    comment: 'Cờ để bật/tắt hiển thị bác sĩ trên app.'
  })
  isActive: boolean;

  @Column({ name: 'clinic_id' })
  clinicId: string;

  @ManyToMany(() => Clinic)
  @JoinColumn({ name: 'clinic_id' })
  clinic: [Clinic];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}