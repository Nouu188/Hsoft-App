import { Injectable, Logger } from '@nestjs/common';
import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { DoseApiClientService } from '@app/api-clients/doses/dose-api-client.service';
import { DoseStatus } from 'apps/scheduling-service/src/doses/entities/dose.entity';
import { FirebaseService } from '../../firebase/firebase.service';
import { HistoryService } from '../../history/history.service';
import { NotificationStatus, NotificationType } from '../../history/entities/notification-history.entity';

interface GroupedNotificationPayload {
  user_id: string;
  dose_ids: string[];
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly doseApiClient: DoseApiClientService,
    private readonly accountApiClient: AccountApiClientService,
    private readonly firebaseService: FirebaseService,
    private readonly historyService: HistoryService, 
  ) {}

  async processDoseReminder(payload: GroupedNotificationPayload): Promise<void> {
    const { user_id, dose_ids } = payload;

    const [doses, user] = await Promise.all([
      this.doseApiClient.fetchAndVerifyDoses(dose_ids, user_id, DoseStatus.PENDING),
      this.accountApiClient.fetchUserByIdentifier(user_id),
    ]);

    if (doses.length === 0) {
      this.logger.warn(`No pending doses found for notification. Acknowledging message.`);
      return;
    }

    if (!user || !user.fcm_tokens?.length) {
      this.logger.warn(`User ${user_id} has no FCM tokens. Saving history as FAILED.`);
      await this.historyService.create({
        user_id: user_id,
        title: 'Không thể gửi nhắc thuốc',
        body: 'Người dùng không có thiết bị nào để nhận thông báo.',
        type: NotificationType.DOSE_REMINDER,
        dose_ids: dose_ids,
        status: NotificationStatus.FAILED,
      });
      return;
    }

    const title = 'Đã đến giờ uống thuốc!';
    const medicationList = doses.map(dose => `- ${dose.medication_name}`).join('\n');
    const body = `Vui lòng uống các loại thuốc sau:\n${medicationList}`;
    const notificationPayload = {
      type: NotificationType.DOSE_REMINDER,
      dose_ids: JSON.stringify(doses.map(d => d.id)),
    };

    const sendResult = await this.firebaseService.sendPushNotification(
      user.fcm_tokens,
      title,
      body,
      notificationPayload,
    );

    const status = sendResult.successCount > 0 ? NotificationStatus.SENT : NotificationStatus.FAILED;
    
    await this.historyService.create({
      user_id: user_id,
      title,
      body,
      type: NotificationType.DOSE_REMINDER,
      dose_ids: dose_ids,
      status,
      payload: {
        ...notificationPayload,
        failureCount: sendResult.failureCount,
      },
    });

    if (sendResult.failedTokens.length > 0) {
      await this.accountApiClient.removeFcmTokens(user_id, sendResult.failedTokens);
    }
  }
}