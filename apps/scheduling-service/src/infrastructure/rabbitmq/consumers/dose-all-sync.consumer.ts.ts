import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { QueueName } from '@app/common/rabbitmq/queues';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { OutboxService } from '@app/outbox';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { DosesAllSyncCommand, DosesSyncResult } from 'apps/scheduling-service/src/domain';
import { SyncAllDosesByUserCommand } from 'apps/scheduling-service/src/application';

@Injectable()
export class DosesAllSyncConsumer {
  private readonly logger = new Logger(DosesAllSyncConsumer.name);

  constructor(
    @Inject('OutboxService_schedulingConnection')  private readonly outboxService: OutboxService,
    private readonly commandBus: CommandBus,
  ) {}

  @RabbitSubscribe({
    exchange: ExchangeName.COMMANDS,
    routingKey: RoutingKey.SYNC_DOSE_HISTORY_COMMAND,
    queue: QueueName.SCHEDULING_SYNC_DOSE_HISTORY_COMMAND,
  })
  public async handleDosesAllSync(payload: DosesAllSyncCommand): Promise<void | Nack> {
    const { userId, hospitalUrl } = payload;
    if (!userId || !hospitalUrl) {
      this.logger.warn(
        `[DosesAllSyncConsumer] Invalid payload received: ${JSON.stringify(payload)}`,
      );
      return;
    }

    this.logger.log(
      `[DosesAllSyncConsumer] Received sync command userId=${userId}, hospitalUrl=${hospitalUrl}`,
    );

    try {
      const result: DosesSyncResult = await this.commandBus.execute(
        new SyncAllDosesByUserCommand(userId, hospitalUrl),
      );

      this.logger.log(
        `[DosesAllSyncConsumer] Successfully completed sync userId=${userId} | created=${result.created}, deleted=${result.deleted}, notifications=${result.notificationsScheduled}`,
      );

      await this.outboxService.createOutboxMessage({
        aggregateType: 'doseHistory',
        aggregateId: userId,
        eventType: 'DoseHistorySyncedSuccess',
        payload: { userId, result },
        exchange: ExchangeName.USER_EVENTS,
        routingKey: RoutingKey.DOSE_HISTORY_SYNCED_SUCCESS,
      });
    } catch (error) {
      this.logger.error(
        `[DosesAllSyncConsumer] Sync failed userId=${userId}`,
        error.stack,
      );

      await this.outboxService.createOutboxMessage({
        aggregateType: 'doseHistory',
        aggregateId: userId,
        eventType: 'DoseHistorySyncedFailure',
        payload: { userId, error: error.message },
        exchange: ExchangeName.USER_EVENTS,
        routingKey: RoutingKey.DOSE_HISTORY_SYNCED_FAILURE,
      });

      return new Nack(false);
    }
  }
}
