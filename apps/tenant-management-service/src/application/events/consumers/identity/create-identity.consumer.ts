import { ExchangeName } from "@app/common/rabbitmq/exchanges";
import { QueueName } from "@app/common/rabbitmq/queues";
import { RoutingKey } from "@app/common/rabbitmq/routing-keys";
import { OutboxService } from "@app/outbox";
import { Nack, RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { OutboxTransactionService } from "apps/tenant-management-service/src/infrastructure/common/services/transaction.service";
import { CreateIdentityCommand } from "../../../commands";

@Injectable()
export class IdentityCreatedConsumer {
  private readonly logger = new Logger(IdentityCreatedConsumer.name);
  private readonly logPrefix = `[IdentityCreatedConsumer]`;

  constructor(
    private readonly commandBus: CommandBus,
    @Inject('OutboxService_tenantConnection') private readonly outboxService: OutboxService,
    private readonly transactionService: OutboxTransactionService,
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

    if (!identity?.phoneNumber || !userId) {
      this.logger.error(
        `${this.logPrefix} Invalid payload. payload=${JSON.stringify(payload)}`,
      );
      return new Nack(false);
    }

    this.logger.debug(
      `${this.logPrefix} Received CREATE_IDENTITY_COMMAND userId=${userId}, phone=${identity.phoneNumber}`,
    );

    try {
      const savedIdentity = await this.commandBus.execute(
        new CreateIdentityCommand(identity, userId, externalHospitalCode),
      );

      await this.transactionService.execute(async (manager) => {
        await this.outboxService.createOutboxMessage(
          {
            aggregateType: "Identity",
            aggregateId: savedIdentity.id,
            eventType: "IDENTITY_CREATED",
            payload: {
              userId: savedIdentity.userId,
              identityId: savedIdentity.id,
              timestamp: new Date().toISOString(),
            },
            exchange: ExchangeName.USER_EVENTS,
            routingKey: RoutingKey.IDENTITY_CREATED_SUCCESS,
          },
          manager, 
        );
      });

      this.logger.log(
        `${this.logPrefix} Identity created & Outbox persisted userId=${userId}, identityId=${savedIdentity.id}`,
      );
    } catch (error) {
      this.logger.error(
        `${this.logPrefix} Failed to handle command userId=${userId}: ${error.message}`,
        error.stack,
      );

      await this.transactionService.execute(async (manager) => {
        await this.outboxService.createOutboxMessage(
          {
            aggregateType: "Identity",
            aggregateId: userId, 
            eventType: "IDENTITY_CREATE_FAILED",
            payload: {
              userId,
              error: error.message,
              timestamp: new Date().toISOString(),
            },
            exchange: ExchangeName.USER_EVENTS,
            routingKey: RoutingKey.IDENTITY_CREATED_FAILURE,
          },
          manager,
        );
      });

      return new Nack(false);
    }
  }
}
