import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExchangeName } from '@app/common/rabbitmq/exchanges/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { OutboxService } from '@app/outbox';

@Injectable()
export class JobSchedulerService {
  private readonly logger = new Logger(JobSchedulerService.name);

  constructor(
    private readonly outboxService: OutboxService
) {}

  @Cron('0 0 0 * * *', { timeZone: 'Asia/Ho_Chi_Minh' })
  async triggerFullSync() {
    this.logger.log('CRON JOB: Storing daily sync event into outbox...');

    await this.outboxService.createOutboxMessage({
      aggregateType: 'doses',
      aggregateId: 'scheduling-cronjob', 
      eventType: 'DOSES_BATCH_SYNC_STARTED',
      payload: {}, 
      exchange: ExchangeName.DOSES_EVENTS,
      routingKey: RoutingKey.DOSES_BATCH_SYNC_STARTED,
    });

    this.logger.log('Outbox message created for daily sync.');
  }
}
