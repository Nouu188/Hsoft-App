import { Injectable, Logger } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { DoseForScheduling } from './dto/schedule-notifications.dto';

@Injectable()
export class NotificationApiClientService {
    private readonly logger = new Logger(NotificationApiClientService.name);

    constructor(private readonly amqpConnection: AmqpConnection) {}

    async scheduleNotifications(doses: DoseForScheduling[]): Promise<void> {
        if (!doses || doses.length === 0) {
            return;
        }

        const notificationsToSchedule = new Map<string, { user_id: string, dose_ids: string[], notifyAt: Date }>();

        for (const dose of doses) {
            const notifyAtTimestamp = new Date(dose.notify_at).getTime();
            const key = `${dose.user_id}@${notifyAtTimestamp}`;
            if (!notificationsToSchedule.has(key)) {
                notificationsToSchedule.set(key, { user_id: dose.user_id, dose_ids: [], notifyAt: dose.notify_at });
            }
            notificationsToSchedule.get(key)!.dose_ids.push(dose.id);
        }

        let publishedCount = 0;
        for (const group of notificationsToSchedule.values()) {
            const delay = new Date(group.notifyAt).getTime() - Date.now();

            if (delay > 0) {
                this.amqpConnection.publish(
                    'notification.exchange',
                    'notification.send.grouped',
                    group, 
                    { headers: { 'x-delay': delay  }, persistent: true },
                );
                publishedCount++;
            }
        }
        
        this.logger.log(`Published ${publishedCount} grouped notification events for user ${doses[0]?.user_id}.`);
    }
}