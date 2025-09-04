import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { QueueName } from '@app/common/rabbitmq/queues';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { Nack, RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { MetricName } from '@app/common/metrics/contracts/metrics.contracts';
import { Counter } from 'prom-client';

interface GroupedNotificationPayload {
    userId: string;
    doseIds: string[];
}

@Injectable()
export class NotificationConsumer {
    private readonly logger = new Logger(NotificationConsumer.name);

    constructor(
        private readonly notificationService: NotificationService,

        @InjectMetric(MetricName.NOTIFICATIONS_SCHEDULED_TOTAL)
        private readonly notificationsScheduledCounter: Counter<string>,
    ) { }

    @RabbitSubscribe({
        exchange: ExchangeName.NOTIFICATION,
        routingKey: RoutingKey.NOTIFICATION_SCHEDULED,
        queue: QueueName.NOTIFICATION_SCHEDULER,
    })
    public async handleSendGroupedNotification(payload: GroupedNotificationPayload): Promise<void | Nack> {
        const { userId, doseIds } = payload;
        this.logger.log(`Received dose reminder event for user ${userId} with ${doseIds.length} doses.`);

        const labels = {
            exchange: ExchangeName.NOTIFICATION,
            routing_key: RoutingKey.NOTIFICATION_SCHEDULED
        };

        try {
            await this.notificationService.processDoseReminder(payload);

            this.notificationsScheduledCounter.inc(labels, 1);

        } catch (error) {
            this.logger.error(`CRITICAL error processing dose reminder for user ${userId}. Message will be NACKed.`, error.stack);

            this.notificationsScheduledCounter.inc({ ...labels, status: 'failure' }, 1);

            return new Nack(false);
        }
    }
}