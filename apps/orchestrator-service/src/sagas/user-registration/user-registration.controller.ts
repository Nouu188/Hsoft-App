import { Controller, Logger } from '@nestjs/common';
import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { UserFirstLoginSagaInitiatedEvent } from './dtos/user-first-login-saga-initiated.event';
import { UserRegistrationService } from './user-registration.service';

@Controller()
export class UserRegistrationController {
  private readonly logger = new Logger(UserRegistrationController.name);

  constructor(private readonly userRegistrationService: UserRegistrationService) { }

  @RabbitSubscribe({
    exchange: ExchangeName.USER_EVENTS,
    routingKey: RoutingKey.USER_FIRST_LOGIN_SAGA_INITIATED,
    queue: 'orchestrator.user-registration.saga-initiator',
    queueOptions: { durable: true },
  })
  async handleSagaInitiation(payload: UserFirstLoginSagaInitiatedEvent): Promise<void | Nack> {
    if (!payload?.userId) {
      this.logger.warn(`[SKIP] Saga initiation missing userId`, { payload });
      return;
    }

    try {
      this.logger.log(`Received SAGA_INITIATED for userId: ${payload.userId}`);
      await this.userRegistrationService.startSaga(payload);
    } catch (err) {
      this.logger.error(`[FATAL] Failed to process SagaInitiation for userId=${payload.userId}`, err.stack);
      return new Nack(false);
    }
  }

  @RabbitSubscribe({
    exchange: ExchangeName.USER_EVENTS,
    routingKey: RoutingKey.IDENTITY_CREATED_SUCCESS,
    queue: 'orchestrator.user-registration.identity-success',
    queueOptions: { durable: true },
  })
  async handleIdentitySuccess(payload: { userId: string; identityId: string }): Promise<void | Nack> {
    await this._handleEvent(payload.userId, RoutingKey.IDENTITY_CREATED_SUCCESS, payload);
  }

  @RabbitSubscribe({
    exchange: ExchangeName.USER_EVENTS,
    routingKey: RoutingKey.IDENTITY_CREATED_FAILURE,
    queue: 'orchestrator.user-registration.identity-failure',
    queueOptions: { durable: true },
  })
  async handleIdentityFailure(payload: { userId: string; error: string }): Promise<void | Nack> {
    await this._handleEvent(payload.userId, RoutingKey.IDENTITY_CREATED_FAILURE, payload);
  }

  @RabbitSubscribe({
    exchange: ExchangeName.USER_EVENTS,
    routingKey: RoutingKey.DOSE_HISTORY_SYNCED_SUCCESS,
    queue: 'orchestrator.user-registration.dose-sync-success',
  })
  async handleDoseSyncSuccess(payload: { userId: string }): Promise<void | Nack> {
    await this._handleEvent(payload.userId, RoutingKey.DOSE_HISTORY_SYNCED_SUCCESS, payload);
  }

  @RabbitSubscribe({
    exchange: ExchangeName.USER_EVENTS,
    routingKey: RoutingKey.DOSE_HISTORY_SYNCED_FAILURE,
    queue: 'orchestrator.user-registration.dose-sync-failure',
  })
  async handleDoseSyncFailure(payload: { userId: string; error: string }): Promise<void | Nack> {
    await this._handleEvent(payload.userId, RoutingKey.DOSE_HISTORY_SYNCED_FAILURE, payload);
  }


  private async _handleEvent(userId: string, eventType: string, payload: any): Promise<void | Nack> {
    if (!userId) {
      this.logger.warn(`[SKIP] Event ${eventType} missing userId`, { payload });
      return;
    }
    try {
      await this.userRegistrationService.handleEvent(userId, eventType, payload);
    } catch (err) {
      this.logger.error(`[FATAL] Failed to process event userId=${userId} type=${eventType}`, err.stack);
      return new Nack(false);
    }
  }
}