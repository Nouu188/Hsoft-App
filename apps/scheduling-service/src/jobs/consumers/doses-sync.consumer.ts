import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DosesSyncService } from '../services/doses-sync.service';
import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { QueueName, RoutingKey } from '@app/common/rabbitmq';

interface SyncRequestPayload {
    ngay?: string;
    userId?: string;
    sodienthoai?: string;
    mabn?: string;
    socmnd?: string;
}
@Injectable()
export class SyncConsumer {
    private readonly logger = new Logger(SyncConsumer.name);

    constructor(
        private readonly dosesSyncService: DosesSyncService,
        private readonly accountApiClient: AccountApiClientService,
    ) {}

    @RabbitSubscribe({
        exchange: ExchangeName.SYNC,
        routingKey: RoutingKey.SYNC_REQUEST,
        queue: QueueName.SYNC_REQUESTS,
    })
    public async handleSyncRequest(payload: SyncRequestPayload) {
        const { userId, sodienthoai, mabn, socmnd , ngay } = payload;
        if(!sodienthoai && !mabn && !socmnd && !userId) {
            throw new Error('Either "mabn" or "sodienthoai" or "socmnd" must be provided.');
        }

        const identifier = sodienthoai || mabn || socmnd;
        
        const user = await this.accountApiClient.fetchUserByIdentifier(identifier!);
        if(!user) {
            return new UnauthorizedException("User not found");
        }
        
        try {
            await this.dosesSyncService.syncDosesInFuture(user, ngay);
        } catch (error) {
            this.logger.error(`Failed to process sync request for userId ${identifier}`, error.stack);
            return new Nack(false);
        }
    }
}