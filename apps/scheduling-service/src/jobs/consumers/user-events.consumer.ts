import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { DosesSyncService } from '../services/doses-sync.service';
import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { QueueName, RoutingKey } from '@app/common/rabbitmq';

@Injectable()
export class UserEventsConsumer {
    private readonly logger = new Logger(UserEventsConsumer.name);

    constructor(
        private readonly dosesSyncService: DosesSyncService,
        private readonly accountApiClient: AccountApiClientService,
    ) {}

    @RabbitSubscribe({
        exchange: ExchangeName.USER_EVENTS,
        routingKey: RoutingKey.USER_FIRST_LOGIN,
        queue: QueueName.SCHEDULING_USER_FIRST_LOGIN,
    })
    public async handleUserFirstLogin(payload: { userId: string }): Promise<void | Nack> {
        const { userId } = payload;
        this.logger.log(`Received 'user.first_login' event for user: ${userId}. Starting full dose history sync...`);

        try {
            const user = await this.accountApiClient.fetchUserByIdentifier(userId);
            if (!user) {
                throw new Error(`User with ID ${userId} not found in Account Service.`);
            }
            
            await this.dosesSyncService.syncAllDoses(user);

        } catch (error) {
            this.logger.error(`Failed to process 'user.first_login' event for user ${userId}`, error.stack);
            return new Nack(false);
        }
    }
}