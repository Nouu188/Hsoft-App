import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OptimisticLockVersionMismatchError, Repository } from 'typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { UserRegistrationSaga, UserRegistrationSagaStatus } from './entities/user-registration-saga.entity';
import { UserFirstLoginIdentityEvent } from './dtos/user-first-login-identity.event';

@Injectable()
export class UserRegistrationService {
    private readonly logger = new Logger(UserRegistrationService.name);

    constructor(
        @InjectRepository(UserRegistrationSaga, 'orchestratorConnection')
        private readonly sagaRepository: Repository<UserRegistrationSaga>,
        private readonly amqpConnection: AmqpConnection,
    ) { }

    async startSaga(event: UserFirstLoginIdentityEvent): Promise<void> {
        const { userId } = event;
        this.logger.log(`[START] Initiating saga for userId=${userId}`);

        const existingSaga = await this.sagaRepository.findOneBy({ userId });
        if (existingSaga) {
            this.logger.warn(`[SKIP] Saga already exists for userId=${userId}`);
            return;
        }

        const saga = this.sagaRepository.create({
            userId,
            status: UserRegistrationSagaStatus.STARTED,
            context: { initialEvent: event },
        });
        await this.sagaRepository.save(saga);

        await this._sendCreateIdentityCommand(saga);
    }

    async handleIdentityCreatedSuccess(payload: { userId: string; identityId: string }) {
        await this._updateSaga(payload.userId, async (saga) => {
            if (saga.status !== UserRegistrationSagaStatus.AWAITING_IDENTITY_CREATION) {
                this.logger.warn(`[SKIP] Received IdentityCreatedSuccess for saga in wrong state: ${saga.status}. UserId=${payload.userId}`);
                return null; 
            }

            saga.status = UserRegistrationSagaStatus.IDENTITY_PROCESSING_COMPLETED;
            saga.context.identityId = payload.identityId;
            this.logger.log(`[STEP] Identity created successfully for userId=${payload.userId}`);

            await this._sendSyncDoseHistoryCommand(saga);
            return saga;
        });
    }

    async handleIdentityCreatedFailure(payload: { userId: string; error: string }) {
        await this._markSagaFailed(payload.userId, `Identity creation failed: ${payload.error}`);
    }

    async handleDoseHistorySyncedSuccess(payload: { userId: string }) {
        await this._updateSaga(payload.userId, async (saga) => {
            if (saga.status !== UserRegistrationSagaStatus.AWAITING_DOSE_SYNC) {
                this.logger.warn(`[SKIP] Received DoseHistorySyncedSuccess for saga in wrong state: ${saga.status}. UserId=${payload.userId}`);
                return null;
            }

            saga.status = UserRegistrationSagaStatus.COMPLETED;
            this.logger.log(`[COMPLETE] Saga completed successfully for userId=${payload.userId}`);
            return saga;
        });
    }

    async handleDoseHistorySyncedFailure(payload: { userId: string; error: string }) {
        await this._markSagaFailed(payload.userId, `Dose history sync failed: ${payload.error}`);
    }

    /*** PRIVATE METHODS ***/

    private async _updateSaga(
        userId: string,
        updateFn: (saga: UserRegistrationSaga) => Promise<UserRegistrationSaga | null>,
        retryCount = 3
    ): Promise<void> {
        if (retryCount <= 0) {
            this.logger.error(`[FATAL] Saga update failed for userId=${userId} after multiple retries.`);
            return;
        }

        const saga = await this._findSagaOrWarn(userId);
        if (!saga) return;

        try {
            const updatedSaga = await updateFn(saga);

            // Nếu updateFn trả về null, có nghĩa là không cần thực hiện hành động lưu
            if (updatedSaga) {
                await this.sagaRepository.save(updatedSaga);
            }
        } catch (error) {
            if (error instanceof OptimisticLockVersionMismatchError) {
                this.logger.warn(`[RACE] Optimistic lock failed for userId=${userId}. Retrying... (${retryCount - 1} left)`);

                await new Promise(res => setTimeout(res, Math.random() * 50 + 50));
                return this._updateSaga(userId, updateFn, retryCount - 1);
            }
            this.logger.error(`[ERROR] Unhandled error during saga update for userId=${userId}`, error.stack);
            throw error;
        }
    }

    private async _sendCreateIdentityCommand(saga: UserRegistrationSaga) {
        const event: UserFirstLoginIdentityEvent = saga.context.initialEvent;
        this.logger.log(`[COMMAND] Sending CREATE_IDENTITY_COMMAND for userId=${event.userId}`);

        await this.amqpConnection.publish(ExchangeName.COMMANDS, RoutingKey.CREATE_IDENTITY_COMMAND, {
            userId: event.userId,
            identity: event.identity,
            externalHospitalCode: event.externalHospitalCode,
        });

        saga.status = UserRegistrationSagaStatus.AWAITING_IDENTITY_CREATION;
        await this.sagaRepository.save(saga);
    }

    private async _sendSyncDoseHistoryCommand(saga: UserRegistrationSaga) {
        const initialEvent = saga.context.initialEvent;
        this.logger.log(`[COMMAND] Sending SYNC_DOSE_HISTORY_COMMAND for userId=${saga.userId}`);

        await this.amqpConnection.publish(ExchangeName.COMMANDS, RoutingKey.SYNC_DOSE_HISTORY_COMMAND, {
            userId: saga.userId,
            hospitalUrl: initialEvent.hospitalUrl,
        });

        saga.status = UserRegistrationSagaStatus.AWAITING_DOSE_SYNC;
        await this.sagaRepository.save(saga);
    }

    private async _markSagaFailed(userId: string, errorMessage: string) {
        const saga = await this.sagaRepository.findOneBy({ userId });
        if (!saga) {
            this.logger.error(`[ERROR] Saga not found for userId=${userId}. Cannot mark failed.`);
            return;
        }

        saga.status = UserRegistrationSagaStatus.FAILED;
        saga.lastErrorMessage = errorMessage;
        await this.sagaRepository.save(saga);

        this.logger.error(`[FAILED] Saga failed for userId=${userId}. Reason: ${errorMessage}`);
    }

    private async _findSagaOrWarn(userId: string): Promise<UserRegistrationSaga | null> {
        const saga = await this.sagaRepository.findOneBy({ userId });
        if (!saga) this.logger.warn(`[WARN] Saga not found for userId=${userId}`);
        return saga;
    }
}
