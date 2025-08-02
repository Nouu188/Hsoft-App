import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { SYNC_EXCHANGE } from '@app/common/rabbitmq/rabbitmq.module';
import { TreatmentSyncService } from '../services/treatment-sync.service';
import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';

interface SyncRequestPayload {
    ngay: string;
    sodienthoai?: string;
    mabn?: string;
    socmnd?: string;
}

@Injectable()
export class SyncConsumer {
    private readonly logger = new Logger(SyncConsumer.name);

    constructor(
        private readonly treatmentSyncService: TreatmentSyncService,
        private readonly userApiClient: AccountApiClientService,
    ) {}

    @RabbitSubscribe({
        exchange: SYNC_EXCHANGE,
        routingKey: 'sync.request',
        queue: 'sync.requests.queue',
    })
    public async handleSyncRequest(payload: SyncRequestPayload) {
        const { sodienthoai, mabn, socmnd , ngay } = payload;
        if(!sodienthoai && !mabn && !socmnd && !ngay) {
            throw new Error("Invalid input");
        }

        const identifier = sodienthoai || mabn || socmnd;
        
        const user = await this.userApiClient.fetchUserByIdentifier(identifier!);
        if(!user) {
            return new UnauthorizedException("User not found");
        }
        
        try {
            await this.treatmentSyncService.syncUserTreatments(user, ngay);
        } catch (error) {
            this.logger.error(`Failed to process sync request for user_id ${identifier}`, error.stack);
            return new Nack(false);
        }
    }
}