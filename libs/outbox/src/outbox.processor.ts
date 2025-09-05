import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { OutboxEntity, OutboxStatus } from './entities/outbox.entity';

@Injectable()
export class OutboxProcessor {
  private readonly logger = new Logger(OutboxProcessor.name);
  private readonly MAX_RETRY = 5;

  constructor(
    private readonly outboxRepository: Repository<OutboxEntity>,
    private readonly amqpConnection: AmqpConnection,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    const messages = await this.outboxRepository.find({
      where: { status: OutboxStatus.PENDING },
      order: { createdAt: 'ASC' },
      take: 50,
    });

    if (!messages.length) return;

    for (const message of messages) {
      try {
        if (!message.exchange || !message.routingKey) {
          throw new Error('Exchange or routingKey is missing in Outbox message');
        }

        this.logger.debug(
          `Publishing event=${message.eventType} aggregate=${message.aggregateType} id=${message.aggregateId} ` +
          `(exchange=${message.exchange}, routingKey=${message.routingKey})`,
        );

        await this.amqpConnection.publish(
          message.exchange,
          message.routingKey,
          message.payload,
        );

        message.status = OutboxStatus.PUBLISHED;
        message.retryCount = 0;
        message.lastError = null;
        await this.outboxRepository.save(message);

        this.logger.log(`Published event=${message.eventType} id=${message.id}`);
      } catch (error: any) {
        message.retryCount = (message.retryCount ?? 0) + 1;
        message.lastError = error?.message ?? 'Unknown error';

        if (message.retryCount >= this.MAX_RETRY) {
          message.status = OutboxStatus.FAILED;
          this.logger.error(
            `Failed permanently event=${message.eventType} id=${message.id}: ${message.lastError}`,
          );
        } else {
          this.logger.warn(
            `Retry ${message.retryCount}/${this.MAX_RETRY} event=${message.eventType} id=${message.id}: ${message.lastError}`,
          );
        }

        await this.outboxRepository.save(message);
      }
    }
  }
}
