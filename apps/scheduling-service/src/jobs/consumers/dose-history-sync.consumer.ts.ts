import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { QueueName } from '@app/common/rabbitmq/queues';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { OutboxService } from '@app/outbox';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { SyncDoseHistoryCommand } from '../../doses/dto/sync-dose-history.command';
import { DosesSyncService } from '../services/doses-sync.service';

@Injectable()
export class DoseHistorySyncConsumer {
  private readonly logger = new Logger(DoseHistorySyncConsumer.name);

  constructor(
    private readonly dosesSyncService: DosesSyncService,
    private readonly outboxService: OutboxService,
  ) { }

  @RabbitSubscribe({
    exchange: ExchangeName.COMMANDS,
    routingKey: RoutingKey.SYNC_DOSE_HISTORY_COMMAND,
    queue: QueueName.SCHEDULING_SYNC_DOSE_HISTORY_COMMAND,
  })
  public async handleSyncDoseHistory(
    payload: SyncDoseHistoryCommand,
  ): Promise<void | Nack> {
    const { userId, hospitalUrl } = payload;
    this.logger.log(`[DoseHistorySyncConsumer] Received command to sync dose history for userId: ${userId}`);

    try {
      const result = await this.dosesSyncService.syncAllDosesByUserId(userId, hospitalUrl);

      this.logger.log(`[DoseHistorySyncConsumer] Completed dose history sync for userId: ${userId}`);

      await this.outboxService.createOutboxMessage({
        aggregateType: 'doseHistory',
        aggregateId: userId,
        eventType: 'DoseHistorySyncedSuccess',
        payload: { userId, result },
        exchange: ExchangeName.USER_EVENTS,
        routingKey: RoutingKey.DOSE_HISTORY_SYNCED_SUCCESS,
      });
    } catch (error) {
      this.logger.error(`[DoseHistorySyncConsumer] Failed to sync doses for userId: ${userId}`, error.stack);

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