import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { ExchangeName } from '@app/common/rabbitmq/exchanges/exchanges';
import { QueueName } from '@app/common/rabbitmq/queues';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { DosesSyncService } from '../services/doses-sync.service';

interface BatchSyncPayload {
    userIds: string[];
}

@Injectable()
export class BatchSyncConsumer {
    private readonly logger = new Logger(BatchSyncConsumer.name);

    constructor(
        private readonly dosesSyncService: DosesSyncService,
        private readonly accountApiClient: AccountApiClientService,
    ) { }

    @RabbitSubscribe({
        exchange: ExchangeName.DOSES_EVENTS,
        routingKey: RoutingKey.DOSES_BATCH_SYNC_PROCESSED,
        queue: QueueName.SCHEDULING_DOSES_BATCH_SYNC,
    })
    public async handleProcessBatch(
        payload: BatchSyncPayload,
    ): Promise<void | Nack> {
        const { userIds } = payload;
        this.logger.log(`Processing batch with ${userIds.length} users...`);

        try {
            const syncPromises = userIds.map(async (userId) => {
                try {
                    const user = await this.accountApiClient.fetchUserById(userId);
                    if (user) {
                        await this.dosesSyncService.syncDosesInFuture(user);
                    } else {
                        this.logger.warn(`User not found for id: ${userId}`);
                    }
                } catch (err) {
                    this.logger.error(
                        `Failed to sync user ${userId} within batch.`,
                        err.stack,
                    );
                }
            });

            await Promise.allSettled(syncPromises);

            this.logger.log(
                `Finished processing batch with ${userIds.length} users.`,
            );
        } catch (error) {
            this.logger.error(
                `Batch failed entirely for ${userIds.length} users.`,
                error.stack,
            );

            // Nack(false) = reject, don't requeue (chuyển sang DLX nếu có)
            // Nack(true) = requeue message lại (có thể retry)
            return new Nack(false);
        }
    }
}
