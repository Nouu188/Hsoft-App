import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { OutboxService } from '@app/outbox';
import { Injectable, Logger } from '@nestjs/common';
import { DoseForScheduling } from './dto/schedule-notifications.dto';

@Injectable()
export class NotificationApiClientService {
    private readonly logger = new Logger(NotificationApiClientService.name);

    constructor(
        private readonly outboxService: OutboxService,
    ) { }

    async scheduleNotifications(doses: DoseForScheduling[]): Promise<void> {
        if (!doses || doses.length === 0) {
            return;
        }

        const notificationsToSchedule = new Map<string, { userId: string, doseIds: string[], notifyAt: Date }>();

        for (const dose of doses) {
            const notifyAtTimestamp = new Date(dose.notify_at).getTime();
            const key = `${dose.userId}@${notifyAtTimestamp}`;
            if (!notificationsToSchedule.has(key)) {
                notificationsToSchedule.set(key, { userId: dose.userId, doseIds: [], notifyAt: dose.notify_at });
            }
            notificationsToSchedule.get(key)!.doseIds.push(dose.id);
        }

        let storedCount = 0;
        for (const group of notificationsToSchedule.values()) {
            const delay = new Date(group.notifyAt).getTime() - Date.now();

            if (delay > 0) {
                await this.outboxService.createOutboxMessage({
                    aggregateType: 'notification',
                    aggregateId: group.userId,
                    eventType: 'GroupedNotificationScheduled',
                    payload: group,
                    exchange: ExchangeName.NOTIFICATION,
                    routingKey: RoutingKey.NOTIFICATION_SCHEDULED,
                });
                storedCount++;
            }
        }

        this.logger.log(`Stored ${storedCount} grouped notification events into outbox for user ${doses[0]?.userId}.`);
    }
}