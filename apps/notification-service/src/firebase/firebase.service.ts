import { Injectable, Inject, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { MulticastMessage } from 'firebase-admin/lib/messaging/messaging-api';

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: admin.app.App
  ) {}

  async sendPushNotification(tokens: string[], title: string, body: string, data?: { [key: string]: string }) {
    if (!tokens || tokens.length === 0) {
      this.logger.warn('No FCM tokens provided to send notification.');
      return;
    }

    const message: MulticastMessage = {
      tokens,
      notification: {
        title,
        body,
      },
      data: data || {},
      android: {
        notification: {
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };

    try {
      const response = await this.firebaseAdmin.messaging().sendEachForMulticast(message);
      this.logger.log(`Successfully sent message to ${response.successCount} devices.`);
      if (response.failureCount > 0) {
        response.responses.forEach(resp => {
          if (!resp.success) {
            this.logger.error(`Failed to send to a device: ${resp.error}`);
            // TODO: Xử lý các token không hợp lệ (ví dụ: xóa khỏi DB)
          }
        });
      }
    } catch (error) {
      this.logger.error('Error sending push notification:', error);
    }
  }
}