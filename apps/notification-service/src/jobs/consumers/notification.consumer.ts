import { RabbitSubscribe, Nack } from '@golevelup/nestjs-rabbitmq';
import { Injectable, Logger } from '@nestjs/common';
import { NOTIFICATION_EXCHANGE } from '@app/common/rabbitmq/rabbitmq.module';
import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { DoseApiClientService } from '@app/api-clients/doses/dose-api-client.service';
import { DoseStatus } from 'apps/scheduling-service/src/doses/entities/dose.entity';
import { FirebaseService } from '../../firebase/firebase.service';

interface GroupedNotificationPayload {
    user_id: string;
    dose_ids: string[];
}

@Injectable()
export class NotificationConsumer {
    private readonly logger = new Logger(NotificationConsumer.name);

    constructor(
        private readonly doseApiClient: DoseApiClientService,
        private readonly userApiClient: AccountApiClientService,
        private firebaseService: FirebaseService,
    ) {}

    @RabbitSubscribe({
        exchange: NOTIFICATION_EXCHANGE,
        routingKey: 'notification.send.grouped',
        queue: 'notification.send.queue',
    })
    public async handleSendGroupedNotification(payload: GroupedNotificationPayload): Promise<void | Nack> {
        const { user_id, dose_ids } = payload;
        this.logger.log(`Received grouped notification for user ${user_id} with ${dose_ids.length} doses.`);

        try {
            const doses = await this.doseApiClient.fetchAndVerifyDoses(dose_ids, user_id, DoseStatus.PENDING)
            if (doses.length === 0) {
                this.logger.warn(`No pending doses found for this notification. Message will be acknowledged.`);
                return; 
            }

            const user = await this.userApiClient.fetchUserByIdentifier(user_id);
            if (!user || !user.fcm_tokens?.length) {
                this.logger.warn(`User ${user_id} has no FCM tokens. Message will be acknowledged.`);
                return; 
            }

            const title = 'Đã đến giờ uống thuốc!';
            const medicationList = doses.map(dose => `- ${dose.medication_name}`).join('\n');
            const body = `Vui lòng uống các loại thuốc sau:\n${medicationList}`;

            await this.firebaseService.sendPushNotification(user.fcm_tokens, title, body, {
                dose_ids: JSON.stringify(doses.map(d => d.id)),
            });

            this.logger.log(`Successfully processed notification for user ${user_id}.`);

        } catch (error) {
            this.logger.error(`CRITICAL error processing notification for user ${user_id}. Message will be NACKed.`, error.stack);
            return new Nack(false);
        }
    }
}