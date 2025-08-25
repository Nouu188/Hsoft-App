import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { Clinic } from '../../clinics/entities/clinic.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

export enum AppointmentType {
  CLINIC = 'CLINIC',
  DOCTOR = 'DOCTOR',
}

export enum AppointmentStatus {
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
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

  @ManyToOne(() => Clinic)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  @Column({ type: 'uuid', name: 'doctor_id', nullable: true })
  doctorId: string;

  @ManyToMany(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

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

  @Column({ type: 'date', name: 'patient_dob' })
  patientDob: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}