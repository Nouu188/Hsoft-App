import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { NotificationService } from '../services/notification.service';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { MetricLabel, MetricName } from '@app/common/metrics/metrics.contracts';
import { MeasureDuration } from '@app/common/metrics/decorators/measure-duration.decorator';
import { TrackBusinessMetric } from '@app/common/metrics/decorators/track-business-metric.decorator';
import { HospitalPatient } from '@app/common/types/hospitalPatient.interface';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { QueueName } from '@app/common/rabbitmq/queues';

interface GroupedNotificationPayload {
    userId: string;
    doseIds: string[];
}

@Injectable()
export class NotificationConsumer {
    private readonly logger = new Logger(NotificationConsumer.name);

    constructor(
        private readonly notificationService: NotificationService,
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

        } catch (error) {
            this.logger.error(`CRITICAL error processing dose reminder for user ${userId}. Message will be NACKed.`, error.stack);

            return new Nack(false);
        }
    }
}