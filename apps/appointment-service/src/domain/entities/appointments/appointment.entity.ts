import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AppointmentType {
  CLINIC = 'CLINIC',
  DOCTOR = 'DOCTOR',
}

export enum AppointmentStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', enum: AppointmentType })
  appointmentType: AppointmentType;

  @Column({ type: 'uuid', name: 'clinic_id', nullable: true })
  clinicId: string;

  @Column({ type: 'uuid', name: 'doctor_id', nullable: true })
  doctorId: string;

  @Column({ type: 'timestamptz', name: 'appointment_time' })
  appointmentTime: Date;

  @Column({ type: 'int', name: 'queue_number' })
  queueNumber: number;

  @Column({ type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.CONFIRMED })
  status: AppointmentStatus;

  // Thông tin hành chính của bệnh nhân tại thời điểm đặt
  @Column({ name: 'patient_name' })
  patientName: string;

  @Column({ name: 'patient_phone' })
  patientPhone: string;

  @Column({ name: 'patient_gender' })
  patientGender: string;

  @Column({ type: 'int', name: 'year_of_birth' })
  birthYear: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}