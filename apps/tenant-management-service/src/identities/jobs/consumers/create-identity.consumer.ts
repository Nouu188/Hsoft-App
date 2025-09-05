import { RoutingKey } from "@app/common/rabbitmq/routing-keys";
import { RabbitSubscribe, Nack, AmqpConnection } from "@golevelup/nestjs-rabbitmq";
import { Injectable, Logger } from "@nestjs/common";
import { IdentitiesService } from "../../services/identities.service";
import { CreateIdentityInput } from "../../dtos/create-identity-input.dto";
import { ExchangeName } from "@app/common/rabbitmq/exchanges";
import { QueueName } from "@app/common/rabbitmq/queues";

interface CreateIdentityCommand { // Đổi tên interface thành Command
  identity: CreateIdentityInput;
  userId: string;
  externalHospitalCode: string;
}

@Injectable()
export class IdentityCreatedConsumer {
  private readonly logger = new Logger(IdentityCreatedConsumer.name);

  constructor(
    private readonly identityService: IdentitiesService,
    private readonly amqpConnection: AmqpConnection, 
  ) {}

  @RabbitSubscribe({
    exchange: ExchangeName.COMMANDS,
    routingKey: RoutingKey.CREATE_IDENTITY_COMMAND,
    queue: QueueName.IDENTITY_CREATE_COMMAND,
  })
  public async handleCreateIdentityCommand(
    payload: CreateIdentityCommand,
  ): Promise<void | Nack> {
    const { identity, userId, externalHospitalCode } = payload;

    if (!identity?.phoneNumber) {
      this.logger.error(
        `[IdentityCreatedConsumer] Missing or invalid identity in payload: ${JSON.stringify(payload)}`,
      );
      return new Nack(false); 
    }

    if (!userId) {
      this.logger.error(
        `[IdentityCreatedConsumer] Missing or invalid userId in payload: ${JSON.stringify(payload)}`,
      );
      return new Nack(false);
    }

    this.logger.debug(`[CreateIdentityConsumer] Received CREATE_IDENTITY_COMMAND for userId=${userId}`);

    try {
      const savedIdentity = await this.identityService.create(identity, userId, externalHospitalCode);

      this.logger.log(`[IdentityCreatedConsumer] Identity synced successfully for userId=${userId}, dbId=${savedIdentity.id}`,);

      await this.amqpConnection.publish(
        ExchangeName.USER_EVENTS,
        RoutingKey.IDENTITY_CREATED_SUCCESS, 
        {
          userId: savedIdentity.userId,
          identityId: savedIdentity.id,
          // Thêm các dữ liệu khác nếu cần cho bước tiếp theo của saga
        },
      );
    } catch (error) {
      this.logger.error(`[CreateIdentityConsumer] Failed to handle command for userId=${userId}: ${error.message}`, error.stack);
      
      await this.amqpConnection.publish(
        ExchangeName.USER_EVENTS,
        RoutingKey.IDENTITY_CREATED_FAILURE, 
        {
          userId: userId,
          error: error.message,
        },
      );
      return new Nack(false);
    }
  }
}
