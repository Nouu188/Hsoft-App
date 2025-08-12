import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { DoseApiClientService } from '@app/api-clients/doses/dose-api-client.service';
import { DoseStatus } from 'apps/scheduling-service/src/doses/entities/dose.entity';
import { FirebaseService } from '../../firebase/firebase.service';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationHistory, NotificationStatus, NotificationType } from '../../history/notification-history.entity';
import { Repository } from 'typeorm';
import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { QueueName, RoutingKey } from '@app/common/rabbitmq';

interface GroupedNotificationPayload {
    user_id: string;
    dose_ids: string[];
}
@Injectable()
export class NotificationConsumer {
    private readonly logger = new Logger(NotificationConsumer.name);

    constructor(
        private readonly doseApiClient: DoseApiClientService,
        private readonly accountApiClient: AccountApiClientService,
        private firebaseService: FirebaseService,
        @InjectRepository(NotificationHistory, 'notificationConnection') 
        private historyRepository: Repository<NotificationHistory>,
    ) {}

    @RabbitSubscribe({
        exchange: ExchangeName.NOTIFICATION,
        routingKey: RoutingKey.NOTIFICATION_SCHEDULE,
        queue: QueueName.NOTIFICATION_SCHEDULER,
    })
    public async handleSendGroupedNotification(payload: GroupedNotificationPayload): Promise<void | Nack> {
        const { user_id, dose_ids } = payload;
        this.logger.log(`Received grouped notification for user ${user_id} with ${dose_ids.length} doses.`);

        try {
            const [doses, user] = await Promise.all([
                this.doseApiClient.fetchAndVerifyDoses(dose_ids, user_id, DoseStatus.PENDING),
                this.accountApiClient.fetchUserByIdentifier(user_id)
            ]);

            if (doses.length === 0) {
                this.logger.warn(`No pending doses found for this notification. Message will be acknowledged.`);
                return;
            }

            if (!user || !user.fcm_tokens?.length) {
                this.logger.warn(`User ${user_id} has no FCM tokens. Message will be acknowledged.`);
                await this.saveHistory(user_id, 'Không thể gửi', 'Người dùng không có token.', dose_ids, NotificationStatus.FAILED);
                return; 
            }

            const title = 'Đã đến giờ uống thuốc!';
            const medicationList = doses.map(dose => `- ${dose.medication_name}`).join('\n');
            const body = `Vui lòng uống các loại thuốc sau:\n${medicationList}`;
            const notificationPayload = {
                type: NotificationType.DOSE_REMINDER,
                doseIds: JSON.stringify(doses.map(d => d.id)),
            };

            await this.firebaseService.sendPushNotification(user.fcm_tokens, title, body, notificationPayload);
            this.logger.log(`Successfully sent notification for user ${user_id}.`);

            await this.saveHistory(user_id, title, body, dose_ids, NotificationStatus.SENT, notificationPayload);

        } catch (error) {
            this.logger.error(`CRITICAL error processing notification for user ${user_id}. Message will be NACKed.`, error.stack);
            return new Nack(false); // Chuyển vào DLQ
        }
    }

    private async saveHistory(
        user_id: string,
        title: string,
        body: string,
        dose_ids: string[],
        status: NotificationStatus,
        payload: Record<string, any> = {}
    ) {
        const historyEntry = this.historyRepository.create({
            user_id, 
            title,
            body,
            dose_ids, 
            status,
            type: NotificationType.DOSE_REMINDER,
            payload,
        });
        await this.historyRepository.save(historyEntry);
    }
}