import { Injectable, Logger } from '@nestjs/common';
import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { DoseApiClientService } from '@app/api-clients/doses/dose-api-client.service';
import { DoseStatus } from 'apps/scheduling-service/src/doses/entities/dose.entity';
import { FirebaseService } from '../../firebase/firebase.service';
import { HistoryService } from '../../history/history.service';
import { NotificationStatus, NotificationType } from '../../history/entities/notification-history.entity';

interface GroupedNotificationPayload {
  userId: string;
  doseIds: string[];
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
    const { userId, doseIds } = payload;

    const [doses, user] = await Promise.all([
      this.doseApiClient.fetchAndVerifyDoses(doseIds, userId, DoseStatus.PENDING),
      this.accountApiClient.fetchUserByIdentifier(userId),
    ]);

    if (doses.length === 0) {
      this.logger.warn(`No pending doses found for notification. Acknowledging message.`);
      return;
    }

    if (!user || !user.fcmTokens?.length) {
      this.logger.warn(`User ${userId} has no FCM tokens. Saving history as FAILED.`);
      await this.historyService.create({
        userId: userId,
        title: 'Không thể gửi nhắc thuốc',
        body: 'Người dùng không có thiết bị nào để nhận thông báo.',
        type: NotificationType.DOSE_REMINDER,
        doseIds: doseIds,
        status: NotificationStatus.FAILED,
      });
      return;
    }

    const title = 'Đã đến giờ uống thuốc!';
    const medicationList = doses.map(dose => `- ${dose.medication_name}`).join('\n');
    const body = `Vui lòng uống các loại thuốc sau:\n${medicationList}`;
    const notificationPayload = {
      type: NotificationType.DOSE_REMINDER,
      doseIds: JSON.stringify(doses.map(d => d.id)),
    };

    const sendResult = await this.firebaseService.sendPushNotification(
      user.fcmTokens,
      title,
      body,
      notificationPayload,
    );

    const status = sendResult.successCount > 0 ? NotificationStatus.SENT : NotificationStatus.FAILED;
    
    await this.historyService.create({
      userId: userId,
      title,
      body,
      type: NotificationType.DOSE_REMINDER,
      doseIds: doseIds,
      status,
      payload: {
        ...notificationPayload,
        failureCount: sendResult.failureCount,
      },
    });

    if (sendResult.failedTokens.length > 0) {
      await this.accountApiClient.removeFcmTokens(userId, sendResult.failedTokens);
    }
  }
}