import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { OutboxEntity, OutboxStatus } from '@app/outbox/entities/outbox.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, OptimisticLockVersionMismatchError } from 'typeorm';
import { UserFirstLoginSagaInitiatedEvent } from './dtos/user-first-login-saga-initiated.event';
import { UserRegistrationSaga, UserRegistrationSagaStatus } from './entities/user-registration-saga.entity';
import { UserRegistrationWorkflow } from './workflows/user-registration.workflow';

@Injectable()
export class UserRegistrationService {
    private readonly logger = new Logger(UserRegistrationService.name);

    constructor(
        @InjectDataSource('orchestratorConnection')
        private readonly dataSource: DataSource,
    ) { }

    async startSaga(event: UserFirstLoginSagaInitiatedEvent): Promise<void> {
        const { userId } = event;
        this.logger.log(`[START] Attempting to start saga for userId=${userId}`);

        try {
            await this.dataSource.transaction(async (manager) => {
                const sagaRepo = manager.getRepository(UserRegistrationSaga);

                if (await sagaRepo.findOneBy({ userId })) {
                    this.logger.warn(`[SKIP] Saga already exists for userId=${userId}. No action taken.`);
                    return;
                }

                const now = new Date().toISOString();
                const saga = sagaRepo.create({
                    userId,
                    status: UserRegistrationSagaStatus.STARTED,
                    context: {
                        initialEvent: event,
                        timestamps: { startedAt: now, lastUpdatedAt: now },
                        errors: [],
                        auditTrail: [],
                    },
                });
                await sagaRepo.save(saga);
                this.logger.log(`[CREATED] Saga created for userId=${userId}`);

                await this._queueNextCommand(saga, manager);
            });
        } catch (err: any) {
            if (this._isUniqueViolation(err)) {
                this.logger.warn(`[RACE] Concurrently created saga for userId=${userId}. My attempt was ignored.`);
                return;
            }
            this.logger.error(`[FATAL] Error during saga start transaction for userId=${userId}`, err.stack);
            throw err;
        }
    }

    async handleEvent(userId: string, eventType: string, payload: any): Promise<void> {
        await this._updateSaga(userId, async (saga, em) => {
            const currentStep = UserRegistrationWorkflow.find((s) => s.step === saga.status);
            if (!currentStep) {
                this.logger.warn(`[SKIP] No workflow step defined for saga status=${saga.status} on userId=${userId}`);
                return null;
            }

            let nextStatus: UserRegistrationSagaStatus | null = null;
            let isFailure = false;

            if (eventType === currentStep.expectedSuccessEvent) {
                nextStatus = currentStep.onSuccess as UserRegistrationSagaStatus;
            } else if (eventType === currentStep.expectedFailureEvent) {
                nextStatus = UserRegistrationSagaStatus.FAILED;
                isFailure = true;
            } else {
                this.logger.debug(`[IGNORE] Event ${eventType} is not expected for saga status=${saga.status}. UserId=${userId}`);
                return null; 
            }

            const fromStatus = saga.status;
            saga.status = nextStatus;
            saga.context.timestamps.lastUpdatedAt = new Date().toISOString();
            saga.context.auditTrail.push({
                timestamp: new Date().toISOString(),
                fromStatus,
                toStatus: saga.status,
                eventType,
            });

            if (isFailure) {
                const errorMessage = payload?.error ?? 'Unknown failure reason';
                saga.lastErrorMessage = errorMessage;
                saga.context.errors.push({ timestamp: new Date().toISOString(), message: errorMessage, eventType });
                this.logger.error(`[FAILED] Saga failed for userId=${userId}. Reason: ${errorMessage}`);
            } else {
                 this.logger.log(`[TRANSITION] Saga for userId=${userId}: ${fromStatus} -> ${saga.status}`);
            }
            
            if (saga.status !== UserRegistrationSagaStatus.COMPLETED && saga.status !== UserRegistrationSagaStatus.FAILED) {
                await this._queueNextCommand(saga, em, payload);
            }
             
            if (saga.status === UserRegistrationSagaStatus.COMPLETED) {
                 this.logger.log(`[COMPLETE] Saga completed for userId=${userId}`);
            }

            return saga;
        });
    }

    private async _queueNextCommand(saga: UserRegistrationSaga, em: EntityManager, triggerPayload: any = {}) {
        const stepDef = UserRegistrationWorkflow.find((s) => s.step === saga.status);
        if (!stepDef?.command) return;

        const { type, routingKey, payloadMapper } = stepDef.command;
        const commandPayload = payloadMapper(saga, triggerPayload);

        const outboxRepo = em.getRepository(OutboxEntity);
        await outboxRepo.save(outboxRepo.create({
            aggregateType: 'UserRegistrationSaga',
            aggregateId: saga.userId,
            eventType: type,
            payload: commandPayload,
            exchange: ExchangeName.COMMANDS,
            routingKey,
            status: OutboxStatus.PENDING,
        }));

        this.logger.log(`[COMMAND] Queued ${type} for userId=${saga.userId}`);
    }

    private async _updateSaga(
        userId: string,
        updateFn: (saga: UserRegistrationSaga, em: EntityManager) => Promise<UserRegistrationSaga | null>,
        retryCount = 3
    ): Promise<void> {
        if (retryCount <= 0) {
            this.logger.error(`[FATAL] Saga update failed for userId=${userId} after multiple retries.`);
            return;
        }

        try {
            await this.dataSource.transaction(async (manager) => {
                const sagaRepo = manager.getRepository(UserRegistrationSaga);
                const saga = await sagaRepo.findOne({ where: { userId }, lock: { mode: 'pessimistic_write' } }); 

                if (!saga) {
                    this.logger.warn(`[WARN] Saga not found for userId=${userId} during update.`);
                    return;
                }

                const updated = await updateFn(saga, manager);
                if (updated) {
                    await sagaRepo.save(updated);
                }
            });
        } catch (error) {
            if (error instanceof OptimisticLockVersionMismatchError) {
                this.logger.warn(`[RACE] Lock failed for userId=${userId}. Retrying... (${retryCount - 1} left)`);
                await new Promise((r) => setTimeout(r, Math.random() * 50 + 50));
                return this._updateSaga(userId, updateFn, retryCount - 1);
            }
            this.logger.error(`[ERROR] Unhandled error during saga update for userId=${userId}`, error);
            throw error;
        }
    }

    private _isUniqueViolation(err: any): boolean {
        return err?.code === '23505';
    }
}