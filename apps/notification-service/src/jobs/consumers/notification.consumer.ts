import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { ExchangeName, QueueName, RoutingKey } from '@app/common/rabbitmq';
import { NotificationService } from '../notification.service';

interface GroupedNotificationPayload {
    user_id: string;
    dose_ids: string[];
}

@Injectable()
export class NotificationConsumer {
    private readonly logger = new Logger(NotificationConsumer.name);

    constructor(
        private readonly notificationService: NotificationService,
    ) {}

    @RabbitSubscribe({
        exchange: ExchangeName.NOTIFICATION,
        routingKey: RoutingKey.NOTIFICATION_SCHEDULE,
        queue: QueueName.NOTIFICATION_SCHEDULER,
    })
    public async handleSendGroupedNotification(payload: GroupedNotificationPayload): Promise<void | Nack> {
        const { user_id, dose_ids } = payload;
        this.logger.log(`Received dose reminder event for user ${user_id} with ${dose_ids.length} doses.`);

        try {
            await this.notificationService.processDoseReminder(payload);
        } catch (error) {
            this.logger.error(`CRITICAL error processing dose reminder for user ${user_id}. Message will be NACKed.`, error.stack);
            return new Nack(false); 
        }
    }
}