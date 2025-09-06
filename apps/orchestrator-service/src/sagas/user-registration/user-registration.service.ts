import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { OutboxEntity, OutboxStatus } from '@app/outbox/entities/outbox.entity';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, OptimisticLockVersionMismatchError, Repository } from 'typeorm';
import { UserFirstLoginIdentityEvent } from './dtos/user-first-login-identity.event';
import { UserRegistrationSaga, UserRegistrationSagaStatus } from './entities/user-registration-saga.entity';

@Injectable()
export class UserRegistrationService {
    private readonly logger = new Logger(UserRegistrationService.name);

    constructor(
        @InjectRepository(UserRegistrationSaga, 'orchestratorConnection')
        private readonly sagaRepository: Repository<UserRegistrationSaga>,

        @InjectDataSource('orchestratorConnection')
        private readonly dataSource: DataSource,
    ) { }

    async startSaga(event: UserFirstLoginIdentityEvent): Promise<void> {
        const { userId, externalHospitalCode, identity } = event;
        this.logger.log(`[START] Starting saga userId=${userId}`);

        const existing = await this.sagaRepository.findOneBy({ userId });
        if (existing) {
            this.logger.warn(`[SKIP] Saga already exists userId=${userId} status=${existing.status}`);
            return;
        }

        const now = new Date().toISOString();
        const saga = this.sagaRepository.create({
            userId,
            status: UserRegistrationSagaStatus.STARTED,
            initialEventPayload: event,
            context: {
                initialEvent: event,
                timestamps: { startedAt: now, lastUpdatedAt: now },
                errors: [],
            },
        });

        await this.dataSource.transaction(async (manager) => {
            const sagaRepo = manager.getRepository(UserRegistrationSaga);
            const outboxRepo = manager.getRepository(OutboxEntity);

            const savedSaga = await sagaRepo.save(saga);

            const outbox = outboxRepo.create({
                aggregateType: 'UserRegistrationSaga',
                aggregateId: savedSaga.userId,
                eventType: 'CREATE_IDENTITY_COMMAND',
                payload: { userId, identity, externalHospitalCode },
                exchange: ExchangeName.COMMANDS,
                routingKey: RoutingKey.CREATE_IDENTITY_COMMAND,
                status: OutboxStatus.PENDING,
            });
            await outboxRepo.save(outbox);

            savedSaga.status = UserRegistrationSagaStatus.AWAITING_IDENTITY_CREATION;
            await sagaRepo.save(savedSaga);
        });

        this.logger.log(`[COMMAND] Queued CREATE_IDENTITY_COMMAND userId=${userId}`);
    }

    async handleIdentityCreatedSuccess(payload: {
        userId: string;
        identityId: string;
    }) {
        await this._updateSaga(
            payload.userId,
            async (saga: UserRegistrationSaga, em: EntityManager) => {
                if (saga.status !== UserRegistrationSagaStatus.AWAITING_IDENTITY_CREATION) {
                    this.logger.warn(`[SKIP] IdentityCreatedSuccess in wrong state userId=${payload.userId} status=${saga.status}`);
                    return null;
                }

                saga.context.identity = {
                    id: payload.identityId,
                    createdAt: new Date().toISOString(),
                };
                saga.context.timestamps.lastUpdatedAt = new Date().toISOString();

                const outboxRepo = em.getRepository(OutboxEntity);
                const initialEvent = saga.context.initialEvent;
                const outbox = outboxRepo.create({
                    aggregateType: 'UserRegistrationSaga',
                    aggregateId: saga.userId,
                    eventType: 'SYNC_DOSE_HISTORY_COMMAND',
                    payload: {
                        userId: saga.userId,
                        hospitalUrl: initialEvent.hospitalUrl,
                    },
                    exchange: ExchangeName.COMMANDS,
                    routingKey: RoutingKey.SYNC_DOSE_HISTORY_COMMAND,
                    status: OutboxStatus.PENDING,
                });
                await outboxRepo.save(outbox);


                saga.status = UserRegistrationSagaStatus.AWAITING_DOSE_SYNC;
                this.logger.log(`[STEP] Identity created userId=${payload.userId} identityId=${payload.identityId}`);
                this.logger.log(`[COMMAND] Queued SYNC_DOSE_HISTORY_COMMAND userId=${saga.userId}`,);

                return saga;
            },
        );
    }

    async handleIdentityCreatedFailure(payload: { userId: string; error: string }) {
        await this._markSagaFailed(
            payload.userId,
            `Identity creation failed: ${payload.error}`,
        );
    }

    async handleDoseHistorySyncedSuccess(payload: {
        userId: string;
        result: { created: number; deleted: number; notificationsScheduled: number };
    }) {
        await this._updateSaga(
            payload.userId,
            async (saga: UserRegistrationSaga) => {
                if (saga.status !== UserRegistrationSagaStatus.AWAITING_DOSE_SYNC) {
                    this.logger.warn(`[SKIP] DoseHistorySyncedSuccess in wrong state userId=${payload.userId} status=${saga.status}`);
                    return null;
                }

                saga.status = UserRegistrationSagaStatus.COMPLETED;
                saga.context.syncResult = payload.result;
                saga.context.timestamps.lastUpdatedAt = new Date().toISOString();

                this.logger.log(`[COMPLETE] Saga completed userId=${payload.userId} doses=${JSON.stringify(payload.result)}`);
                return saga;
            },
        );
    }

    async handleDoseHistorySyncedFailure(payload: {
        userId: string;
        error: string;
    }) {
        await this._markSagaFailed(
            payload.userId,
            `Dose history sync failed: ${payload.error}`,
        );
    }

    /*** PRIVATE HELPERS ***/

    private async _updateSaga(
        userId: string,
        updateFn: (
            saga: UserRegistrationSaga,
            em: EntityManager,
        ) => Promise<UserRegistrationSaga | null> | (UserRegistrationSaga | null),
        retryCount = 3,
    ): Promise<void> {
        if (retryCount <= 0) {
            this.logger.error(`[FATAL] Saga update failed for userId=${userId} after multiple retries.`);
            return;
        }

        try {
            await this.dataSource.transaction(async (manager) => {
                const sagaRepo = manager.getRepository(UserRegistrationSaga);
                const saga = await sagaRepo.findOneBy({ userId });

                if (!saga) {
                    this.logger.warn(`[WARN] Saga not found for userId=${userId}`);
                    return;
                }

                const updated = await Promise.resolve(updateFn(saga, manager));
                if (updated) {
                    await sagaRepo.save(updated);
                }
            });
        } catch (error) {
            if (error instanceof OptimisticLockVersionMismatchError) {
                this.logger.warn(`[RACE] Optimistic lock failed for userId=${userId}. Retrying... (${retryCount - 1} left)`);

                await new Promise((r) =>
                    setTimeout(r, Math.random() * 50 + 50),
                );
                return this._updateSaga(userId, updateFn, retryCount - 1);
            }
            this.logger.error(
                `[ERROR] Unhandled error during saga update for userId=${userId}`,
                error,
            );
            throw error;
        }
    }

    private async _markSagaFailed(userId: string, errorMessage: string) {
        await this.dataSource.transaction(async (manager) => {
            const sagaRepo = manager.getRepository(UserRegistrationSaga);
            const saga = await sagaRepo.findOneBy({ userId });
            if (!saga) {
                this.logger.error(`[ERROR] Saga not found userId=${userId}`);
                return;
            }

            saga.status = UserRegistrationSagaStatus.FAILED;
            saga.lastErrorMessage = errorMessage;

            saga.context.errors = saga.context.errors || [];
            saga.context.errors.push(errorMessage);
            saga.context.timestamps.lastUpdatedAt = new Date().toISOString();

            await sagaRepo.save(saga);
            this.logger.error(`[FAILED] Saga failed userId=${userId} reason=${errorMessage}`);
        });
    }
}
