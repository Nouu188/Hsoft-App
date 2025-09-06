import { AmqpConnection, RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { DosesSyncService } from '../services/doses-sync.service';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { QueueName } from '@app/common/rabbitmq/queues';
import { SyncDoseHistoryCommand } from '../../doses/dto/sync-dose-history.command';

@Injectable()
export class DoseHistorySyncConsumer {
  private readonly logger = new Logger(DoseHistorySyncConsumer.name);

  constructor(
    private readonly dosesSyncService: DosesSyncService,
    private readonly amqpConnection: AmqpConnection,
  ) {}

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

      await this.amqpConnection.publish(
        ExchangeName.USER_EVENTS,
        RoutingKey.DOSE_HISTORY_SYNCED_SUCCESS,
        { userId, result },
      );
    } catch (error) {
      this.logger.error(`[DoseHistorySyncConsumer] Failed to sync doses for userId: ${userId}`, error.stack);

      await this.amqpConnection.publish(
        ExchangeName.USER_EVENTS,
        RoutingKey.DOSE_HISTORY_SYNCED_FAILURE,
        { userId, error: error.message },
      );

      return new Nack(false);
    }
  }
}