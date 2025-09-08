import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { ExchangeName } from '@app/common/rabbitmq/exchanges/exchanges';
import { QueueName } from '@app/common/rabbitmq/queues';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DosesSyncService } from '../services/doses-sync.service';

interface SyncRequestPayload {
  phoneNumber: string;
  hospitalUrl?: string;
}

@Injectable()
export class SyncConsumer {
  private readonly logger = new Logger(SyncConsumer.name);

  constructor(
    private readonly dosesSyncService: DosesSyncService,
    private readonly accountApiClient: AccountApiClientService,
  ) { }

  @RabbitSubscribe({
    exchange: ExchangeName.DOSES_EVENTS_DELAY,
    routingKey: RoutingKey.DOSES_SYNC_REQUESTED,
    queue: QueueName.SCHEDULING_DOSES_SYNC_REQUESTS,
  })
  public async handleSyncRequest(payload: SyncRequestPayload): Promise<void | Nack> {
    const { phoneNumber, hospitalUrl } = payload;

    if (!phoneNumber) {
      this.logger.error(`[SyncConsumer] Payload missing 'identity' or 'phoneNumber': ${JSON.stringify(payload)}`);
      return new Nack(false);
    }

    if (!hospitalUrl) {
      this.logger.error(`[SyncConsumer] Payload missing 'hospitalUrl': ${JSON.stringify(payload)}`);
      return new Nack(false);
    }

    let user;
    try {
      user = await this.accountApiClient.fetchUserByPhoneNumber(phoneNumber);
      if (!user) {
        this.logger.warn(`[SyncConsumer] User with phoneNumber ${phoneNumber} not found`);
        throw new UnauthorizedException('User not found');
      }
    } catch (error) {
      this.logger.error(`[SyncConsumer] Failed to fetch user for phoneNumber ${phoneNumber}`, error.stack);
      return new Nack(false);
    }

    try {
      this.logger.log(`[SyncConsumer] Starting dose sync for user ${user.id} (${phoneNumber})`);

      await this.dosesSyncService.syncDosesInFuture(user, hospitalUrl);

      this.logger.log(`[SyncConsumer] Completed dose sync for user ${user.id}`);
    } catch (error) {
      this.logger.error(`[SyncConsumer] Failed to process sync request for user ${user.id}`, error.stack);
      return new Nack(false);
    }
  }
}
