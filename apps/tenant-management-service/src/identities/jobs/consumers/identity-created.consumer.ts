import { ExchangeName, QueueName, RoutingKey } from "@app/common/rabbitmq";
import { RabbitSubscribe, Nack } from "@golevelup/nestjs-rabbitmq";
import { Injectable, Logger } from "@nestjs/common";
import { IdentitiesService } from "../../services/identities.service";
import { CreateIdentityInput } from "../../dtos/create-identity-input.dto";

interface IdentityCreatedEvent {
  identity?: CreateIdentityInput;
  userId: string;
  externalHospitalCode: string;
}

@Injectable()
export class IdentityCreatedConsumer {
  private readonly logger = new Logger(IdentityCreatedConsumer.name);

  constructor(private readonly identityService: IdentitiesService) { }

  @RabbitSubscribe({
    exchange: ExchangeName.USER_EVENTS,
    routingKey: RoutingKey.USER_FIRST_LOGIN_IDENTITY,
    queue: QueueName.IDENTITY_USER_FIRST_LOGIN,
  })
  public async handleIdentityCreatedRequest(
    payload: IdentityCreatedEvent,
  ): Promise<void | Nack> {
    const identity = payload?.identity;
    const userId = payload?.userId;
    const externalHospitalCode = payload?.externalHospitalCode;

    if (!identity?.phoneNumber) {
      this.logger.error(
        `[IdentityCreatedConsumer] Missing or invalid identity in payload: ${JSON.stringify(payload)}`,
      );
      return new Nack(false); // không requeue để tránh spam
    }

    if (!userId) {
      this.logger.error(
        `[IdentityCreatedConsumer] Missing or invalid userId in payload: ${JSON.stringify(payload)}`,
      );
      return new Nack(false); // không requeue để tránh spam
    }

    this.logger.debug(
      `[IdentityCreatedConsumer] Received USER_FIRST_LOGIN_IDENTITY event for userId=${userId}`,
    );

    try {
      const savedIdentity = await this.identityService.create(identity, userId, externalHospitalCode);

      this.logger.log(
        `[IdentityCreatedConsumer] Identity synced successfully for userId=${userId}, dbId=${savedIdentity.id}`,
      );
    } catch (error) {
      this.logger.error(
        `[IdentityCreatedConsumer] Failed to handle USER_FIRST_LOGIN_IDENTITY for userId=${userId}: ${error.message}`,
        error.stack,
      );
      return new Nack(false);
    }
  }
}
