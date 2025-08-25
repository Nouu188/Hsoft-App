import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

@Entity('hospital_connections')
@Unique(['userId', 'hospitalId']) 
export class HospitalConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'hospital_id', comment: 'ID của bệnh viện từ Tenant Management Service' })
  hospitalId: string;

  @Column({ name: 'patient_code_at_hospital', comment: 'Mã bệnh nhân (mabn) của người dùng tại bệnh viện này' })
  patientCodeAtHospital: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'linked_at' })
  linkedAt: Date;

  @ManyToOne(() => User, user => user.hospitalConnections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}