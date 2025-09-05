import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SagaStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('saga')
export class SagaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  sagaType: string; // ví dụ: 'UserFirstLoginSaga'

  @Column()
  @Index()
  aggregateType: string; // ví dụ: 'user'

  @Column()
  aggregateId: string; // ví dụ: userId 

  @Column({
    type: 'enum',
    enum: SagaStatus,
    default: SagaStatus.PENDING,
  })
  status: SagaStatus;

  @Column({ type: 'jsonb', nullable: true })
  currentStep: Record<string, any>; // trạng thái step hiện tại, dữ liệu tạm

  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, any>; // lưu payload, dữ liệu liên quan đến saga

  @Column({ default: 0 })
  retryCount: number;

  @Column({ type: 'text', nullable: true })
  lastError: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
