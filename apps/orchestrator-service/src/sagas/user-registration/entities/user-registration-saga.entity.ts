import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryColumn,
    UpdateDateColumn,
    VersionColumn
} from 'typeorm';
import { UserFirstLoginSagaInitiatedEvent } from '../dtos/user-first-login-saga-initiated.event';

export enum UserRegistrationSagaStatus {
    STARTED = 'STARTED',
    IDENTITY_PROCESSING_COMPLETED = 'IDENTITY_PROCESSING_COMPLETED',
    SCHEDULING_PROCESSING_COMPLETED = 'SCHEDULING_PROCESSING_COMPLETED',
    AWAITING_IDENTITY_CREATION = 'AWAITING_IDENTITY_CREATION',
    AWAITING_USER_CREATION = 'AWAITING_USER_CREATION',
    AWAITING_DOSE_SYNC = 'AWAITING_DOSE_SYNC',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

export interface SagaContext {
  initialEvent: UserFirstLoginSagaInitiatedEvent;
  timestamps: {
    startedAt: string;
    lastUpdatedAt: string;
  };
  identityId?: string;
  errors: { timestamp: string; message: string; eventType?: string }[];
  auditTrail: {
    timestamp: string;
    fromStatus: UserRegistrationSagaStatus;
    toStatus: UserRegistrationSagaStatus;
    eventType: string;
  }[];
}

@Entity('user_registration_sagas')
export class UserRegistrationSaga {
  @PrimaryColumn('uuid') 
  userId: string;

  @Index()
  @Column({ type: 'enum', enum: UserRegistrationSagaStatus })
  status: UserRegistrationSagaStatus;

  @Column({ type: 'jsonb' })
  context: SagaContext;

  @Column({ type: 'text', nullable: true })
  lastErrorMessage?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}