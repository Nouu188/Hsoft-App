import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { DosesSyncService } from '../services/doses-sync.service';
import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { ExchangeName } from '@app/common/rabbitmq/exchanges/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { IdentityPayload } from 'apps/tenant-management-service/src/identities/dtos/identity.payload';
import { QueueName } from '@app/common/rabbitmq/queues';

interface UserFirstLoginPayload {
  identity?: IdentityPayload;
  hospitalUrl?: string;
}

@Injectable()
export class DosesSyncAllConsumer {
  private readonly logger = new Logger(DosesSyncAllConsumer.name);

  constructor(
    private readonly dosesSyncService: DosesSyncService,
    private readonly accountApiClient: AccountApiClientService,
  ) {}

  @RabbitSubscribe({
    exchange: ExchangeName.USER_EVENTS,
    routingKey: RoutingKey.USER_FIRST_LOGIN_SCHEDULING,
    queue: QueueName.SCHEDULING_USER_FIRST_LOGIN,
  })
  public async handleUserFirstLogin(
    payload: UserFirstLoginPayload,
  ): Promise<void | Nack> {
    const identity = payload?.identity;
    const hospitalUrl = payload?.hospitalUrl;

    if (!identity) {
      this.logger.error(`[DosesSyncAllConsumer] Missing 'identity' in payload: ${JSON.stringify(payload)}`);
      return new Nack(false);
    }

    const phoneNumber = identity.phoneNumber;
    if (!phoneNumber) {
      this.logger.error(`[DosesSyncAllConsumer] Identity missing 'phoneNumber': ${JSON.stringify(identity)}`);
      return new Nack(false);
    }

    if (!hospitalUrl) {
      this.logger.error(`[DosesSyncAllConsumer] Missing 'hospitalUrl' in payload: ${JSON.stringify(payload)}`);
      return new Nack(false);
    }

    this.logger.log(`[DosesSyncAllConsumer] Received 'user.first_login' for user: ${phoneNumber}. Starting full dose history sync...`);

    try {
      const user = await this.accountApiClient.fetchUserByPhoneNumber(phoneNumber);

      if (!user) {
        this.logger.warn(`[DosesSyncAllConsumer] User not found in Account Service for phoneNumber: ${phoneNumber}`);
        return new Nack(false);
      }

      await this.dosesSyncService.syncAllDoses(user, hospitalUrl);

      this.logger.log(`[DosesSyncAllConsumer] Completed full dose history sync for user: ${phoneNumber}`);
    } catch (error) {
      this.logger.error(`[DosesSyncAllConsumer] Failed to process 'user.first_login' for user ${phoneNumber}`, error.stack);
      return new Nack(false);
    }
  }
}
