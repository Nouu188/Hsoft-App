import { Column, Entity, PrimaryGeneratedColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity('clinics')
export class Clinic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ 
    unique: true, 
    name: 'external_makp',
    comment: 'Mã khoa phòng từ hệ thống bệnh viện, dùng để đồng bộ hóa.'
  })
  externalMakp: string;

  @Column()
  name: string;

  @Column({ 
    default: true,
    name: 'is_active',
    comment: 'Cờ để bật/tắt hiển thị phòng khám trên app mà không cần xóa.'
  })
  isActive: boolean;

  @OneToMany(() => Appointment, app => app.clinic)
  appointments: Appointment[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}