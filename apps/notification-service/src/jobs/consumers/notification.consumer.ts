import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ExchangeName, QueueName, RoutingKey } from '@app/common/rabbitmq';
import { NotificationService } from '../services/notification.service';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { MetricLabel, MetricName } from '@app/common/metrics/metrics.contracts';
import { MeasureDuration } from '@app/common/metrics/decorators/measure-duration.decorator';
import { TrackBusinessMetric } from '@app/common/metrics/decorators/track-business-metric.decorator';
import { HospitalPatient } from '@app/api-clients/hospital/dto/hospitalPatient.dto';

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

    @MeasureDuration(MetricName.NOTIFICATIONS_SCHEDULED_TOTAL, {
        [MetricLabel.REGISTRATION_SOURCE]: "handleSendGroupedNotification",
        [MetricLabel.TABLE_NAME]: "doses",
    })
    @TrackBusinessMetric(MetricName.NOTIFICATIONS_SCHEDULED_TOTAL, {
        labels: (args: [HospitalPatient], error?: any) => ({
            [MetricLabel.REGISTRATION_SOURCE]: 'handleSendGroupedNotification',
            [MetricLabel.STATUS]: error ? 'error' : 'success',
        }),
    })
    @RabbitSubscribe({
        exchange: ExchangeName.NOTIFICATION,
        routingKey: RoutingKey.NOTIFICATION_SCHEDULE,
        queue: QueueName.NOTIFICATION_SCHEDULER,
    })
    public async handleSendGroupedNotification(payload: GroupedNotificationPayload): Promise<void | Nack> {
        const { userId, doseIds } = payload;
        this.logger.log(`Received dose reminder event for user ${userId} with ${doseIds.length} doses.`);

        const labels = {
            exchange: ExchangeName.NOTIFICATION,
            routing_key: RoutingKey.NOTIFICATION_SCHEDULE
        };

        try {
            await this.notificationService.processDoseReminder(payload);

        } catch (error) {
            this.logger.error(`CRITICAL error processing dose reminder for user ${userId}. Message will be NACKed.`, error.stack);

            return new Nack(false);
        }
    }
}