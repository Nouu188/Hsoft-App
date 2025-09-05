import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    VersionColumn,
} from 'typeorm';

export enum UserRegistrationSagaStatus {
    STARTED = 'STARTED',
    IDENTITY_PROCESSING_COMPLETED = 'IDENTITY_PROCESSING_COMPLETED',
    SCHEDULING_PROCESSING_COMPLETED = 'SCHEDULING_PROCESSING_COMPLETED',
    AWAITING_IDENTITY_CREATION = 'AWAITING_IDENTITY_CREATION',
    AWAITING_DOSE_SYNC = 'AWAITING_DOSE_SYNC',
    COMPLETED = 'COMPLETED',
    FAILED = 'FAILED',
}

@Entity('user_registration_sagas')
export class UserRegistrationSaga {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @VersionColumn() 
    version: number;

    @Index()
    @Column('uuid')
    userId: string;

    @Column({
        type: 'enum',
        enum: UserRegistrationSagaStatus,
        default: UserRegistrationSagaStatus.STARTED,
    })
    status: UserRegistrationSagaStatus;

    @Column({ type: 'jsonb', nullable: false })
    context: Record<string, any>;

    @Column({ type: 'jsonb' })
    initialEventPayload: Record<string, any>;

    @Column({ type: 'text', nullable: true })
    lastErrorMessage?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}