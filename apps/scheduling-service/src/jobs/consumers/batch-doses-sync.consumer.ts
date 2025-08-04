// apps/scheduling-service/src/jobs/consumers/batch-sync.consumer.ts
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { DosesSyncService } from '../services/doses-sync.service';
import { BATCH_SYNC_EXCHANGE } from '@app/common/rabbitmq/rabbitmq.module';
import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';

interface BatchSyncPayload {
    userIds: string[];
}

@Injectable()
export class BatchSyncConsumer {
    private readonly logger = new Logger(BatchSyncConsumer.name);

    constructor(
        private readonly dosesSyncService: DosesSyncService,
        private readonly accountApiClient: AccountApiClientService, // Để lấy thông tin user
    ) {}

    @RabbitSubscribe({
        exchange: BATCH_SYNC_EXCHANGE,
        routingKey: 'batch.process_sync',
        queue: 'batch.sync.queue',
    })
    public async handleProcessBatch(payload: BatchSyncPayload): Promise<void> {
        const { userIds } = payload;
        this.logger.log(`Processing batch with ${userIds.length} users...`);

        // Xử lý từng user trong batch một cách song song
        const syncPromises = userIds.map(async (userId) => {
            try {
                // Lấy thông tin user đầy đủ từ Account Service
                const user = await this.accountApiClient.fetchUserByIdentifier(userId);
                if (user) {
                    await this.dosesSyncService.syncDosesForUser(user);
                }
            } catch (error) {
                this.logger.error(`Failed to sync user ${userId} within batch.`, error.stack);
            }
        });

        await Promise.allSettled(syncPromises);
        this.logger.log(`Finished processing batch with ${userIds.length} users.`);
    }
}