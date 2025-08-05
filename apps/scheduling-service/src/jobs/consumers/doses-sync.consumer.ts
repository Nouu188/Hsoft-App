import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { SYNC_EXCHANGE } from '@app/common/rabbitmq/rabbitmq.module';
import { DosesSyncService } from '../services/doses-sync.service';
import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';

interface SyncRequestPayload {
    ngay?: string;
    user_id?: string;
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
        exchange: SYNC_EXCHANGE,
        routingKey: 'sync.request',
        queue: 'sync.requests.queue',
    })
    public async handleSyncRequest(payload: SyncRequestPayload) {
        const { user_id, sodienthoai, mabn, socmnd , ngay } = payload;
        if(!sodienthoai && !mabn && !socmnd && !user_id) {
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
            this.logger.error(`Failed to process sync request for user_id ${identifier}`, error.stack);
            return new Nack(false);
        }
    }
}