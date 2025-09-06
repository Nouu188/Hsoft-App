import { ExchangeName } from '@app/common/rabbitmq/exchanges/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Controller, Logger } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';
import { UserFirstLoginIdentityEvent } from './dtos/user-first-login-identity.event';
import { UserRegistrationService } from './user-registration.service';
import { SyncResult } from 'apps/scheduling-service/src/jobs/services/doses-sync.service';

@Controller()
export class UserRegistrationController {
  private readonly logger = new Logger(UserRegistrationController.name);

  constructor(private readonly userRegistrationService: UserRegistrationService) {}

  @RabbitSubscribe({
    exchange: ExchangeName.USER_EVENTS,
    routingKey: RoutingKey.USER_FIRST_LOGIN_SAGA_INITIATED,
    queue: 'orchestrator.user-registration.saga-initiator', 
  })
  async handleSagaInitiation(
    @Payload() payload: UserFirstLoginIdentityEvent,
  ) {
    this.logger.log(`Received UserFirstLoginSagaInitiated event for user: ${payload.userId}`);

    await this.userRegistrationService.startSaga(payload);
  }

  @RabbitSubscribe({
    exchange: ExchangeName.USER_EVENTS,
    routingKey: RoutingKey.IDENTITY_CREATED_SUCCESS, 
    queue: 'orchestrator.user-registration.identity-success',
  })
  async handleIdentityCreatedSuccess(@Payload() payload: { userId: string; identityId: string }) {
    await this.userRegistrationService.handleIdentityCreatedSuccess(payload);
  }

  @RabbitSubscribe({
    exchange: ExchangeName.USER_EVENTS,
    routingKey: RoutingKey.IDENTITY_CREATED_FAILURE,
    queue: 'orchestrator.user-registration.identity-failure',
  })
  async handleIdentityCreatedFailure(@Payload() payload: { userId: string; error: string }) {
    await this.userRegistrationService.handleIdentityCreatedFailure(payload);
  }

  @RabbitSubscribe({
    exchange: ExchangeName.USER_EVENTS,
    routingKey: RoutingKey.DOSE_HISTORY_SYNCED_SUCCESS,
    queue: 'orchestrator.user-registration.dose-sync-success',
  })
  async handleDoseHistorySyncedSuccess(@Payload() payload: { userId: string, result: SyncResult }) {
    await this.userRegistrationService.handleDoseHistorySyncedSuccess(payload);
  }

  @RabbitSubscribe({
    exchange: ExchangeName.USER_EVENTS,
    routingKey: RoutingKey.DOSE_HISTORY_SYNCED_FAILURE,
    queue: 'orchestrator.user-registration.dose-sync-failure',
  })
  async handleDoseHistorySyncedFailure(@Payload() payload: { userId: string; error: string }) {
    await this.userRegistrationService.handleDoseHistorySyncedFailure(payload);
  }
}