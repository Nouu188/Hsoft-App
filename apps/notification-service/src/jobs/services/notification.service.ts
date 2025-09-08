import { AccountApiClientService } from '@app/api-clients/account/account-api-client.service';
import { DoseApiClientService } from '@app/api-clients/doses/dose-api-client.service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DoseStatus } from 'apps/scheduling-service/src/doses/entities/dose.entity';
import { DataSource } from 'typeorm';
import { FirebaseService } from '../../firebase/firebase.service';
import { NotificationStatus, NotificationType } from '../../notification-history/entities/notification-history.entity';
import { NotificationHistoryService } from '../../notification-history/notification-history.service';

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
    private readonly historyService: NotificationHistoryService,
    @InjectDataSource('notificationConnection') private readonly dataSource: DataSource, 
  ) {}

  async processDoseReminder(payload: GroupedNotificationPayload): Promise<void> {
    const { userId, doseIds } = payload;

    const [doses, user] = await Promise.all([
      this.doseApiClient.fetchAndVerifyDoses(doseIds, userId, DoseStatus.PENDING),
      this.accountApiClient.fetchUserById(userId),
    ]);

    if (doses.length === 0) {
      this.logger.warn(`No pending doses found for notification. Acknowledging message.`);
      return;
    }

    if (!user || !user.deviceTokens?.length) {
      this.logger.warn(`User ${userId} has no FCM tokens. Saving history as FAILED.`);

      // Transaction đảm bảo ghi lịch sử an toàn
      await this.dataSource.transaction(async (manager) => {
        await this.historyService.create({
          userId,
          title: 'Không thể gửi nhắc thuốc',
          body: 'Người dùng không có thiết bị nào để nhận thông báo.',
          type: NotificationType.DOSE_REMINDER,
          doseIds,
          status: NotificationStatus.FAILED,
          sentAt: new Date(),
        });
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
      user.deviceTokens,
      title,
      body,
      notificationPayload,
    );

    const status = sendResult.successCount > 0 ? NotificationStatus.SENT : NotificationStatus.FAILED;

    // Transaction đảm bảo cả lưu lịch sử + xóa token (nếu có) cùng atomic
    await this.dataSource.transaction(async (manager) => {
      await this.historyService.create({
        userId,
        title,
        body,
        type: NotificationType.DOSE_REMINDER,
        doseIds,
        status,
        payload: {
          ...notificationPayload,
          failureCount: sendResult.failureCount,
        },
        sentAt: new Date(),
      });

      if (sendResult.failedTokens.length > 0) {
        await this.accountApiClient.removeFcmTokens(userId, sendResult.failedTokens);
      }
    });
  }
}
