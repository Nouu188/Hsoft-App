import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { ExchangeName } from '@app/common/rabbitmq/exchanges/exchanges';
import { QueueName } from '@app/common/rabbitmq/queues';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { AmqpConnection, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

const BATCH_SIZE = 200; // Mỗi batch xử lý 100 user
const BATCH_DELAY_MINUTES = 5; 

@Injectable()
export class BatchCreationConsumer {
    private readonly logger = new Logger(BatchCreationConsumer.name);

    constructor(
        private readonly accountApiClient: AccountApiClientService,
        private readonly amqpConnection: AmqpConnection,
    ) {}

    @RabbitSubscribe({
        exchange: ExchangeName.DOSES_EVENTS,
        routingKey: RoutingKey.DOSES_BATCH_SYNC_STARTED,
        queue: QueueName.SCHEDULING_DOSES_BATCH_CREATION,
    })
    public async handleStartFullSync(): Promise<void> {
        this.logger.log('Received request to start full sync. Fetching all users...');
        
        const usersToSync = await this.accountApiClient.fetchAllUser();

        if (usersToSync.length === 0) {
            this.logger.log('No users found to create batches.');
            return;
        }

        this.logger.log(`Found ${usersToSync.length} users. Creating batches of ${BATCH_SIZE}...`);

        const userIds = usersToSync.map(u => u.id);
        let batchIndex = 0;

        for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
            const batch = userIds.slice(i, i + BATCH_SIZE);
            const delay = batchIndex * BATCH_DELAY_MINUTES * 60 * 1000; // Delay tính bằng ms

            this.amqpConnection.publish(
                ExchangeName.DOSES_EVENTS,
                RoutingKey.DOSES_BATCH_SYNC_PROCESSED,
                { userIds: batch },
                { headers: { 'x-delay': delay } }
            );
            
            this.logger.log(`Published batch #${batchIndex + 1} with ${batch.length} users, scheduled with a delay of ${delay / 60000} minutes.`);
            batchIndex++;
        }
    }
}