import { Inject, Injectable, Logger } from '@nestjs/common';
import { DeviceToken } from 'apps/account-service/src/users/entities/user.entity';
import * as admin from 'firebase-admin';
import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';

export interface SendNotificationResult {
  successCount: number;
  failureCount: number;
  failedTokens: DeviceToken[];
}

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: admin.app.App,
  ) {}

  async sendPushNotification(
    tokens: DeviceToken[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<SendNotificationResult> {
    if (!tokens?.length) {
      this.logger.warn('No FCM tokens provided. Skipping sending.');
      return { successCount: 0, failureCount: 0, failedTokens: [] };
    }

    // Firebase giới hạn 500 token mỗi lần
    const tokensToSend = tokens.slice(0, 500);
    if (tokens.length > 500) {
      this.logger.warn(
        `Token count (${tokens.length}) exceeds 500. Only the first 500 will be used.`,
      );
    }

    const message = {
      tokens: tokensToSend.map((t) => t.token),
      notification: { title, body },
      data: data ?? {},
      android: { notification: { sound: 'default' } },
      apns: { payload: { aps: { sound: 'default' } } },
    };

    try {
      const response: BatchResponse =
        await this.firebaseAdmin.messaging().sendEachForMulticast(message);

      const failedTokens: DeviceToken[] = [];

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const failedToken = tokensToSend[idx];
          const errorCode = resp.error?.code;
          const errorMsg = resp.error?.message;

          this.logger.error(
            `Failed to send to token=${failedToken.token} type=${failedToken.type} | Error: ${errorCode} - ${errorMsg}`,
          );

          if (errorCode && this.isUnregisteredTokenError(errorCode)) {
            failedTokens.push(failedToken);
          }
        }
      });

      this.logger.log(
        `FCM response: ${response.successCount} success, ${response.failureCount} failure.`,
      );

      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens,
      };
    } catch (error) {
      this.logger.error('Critical error during FCM sendEachForMulticast:', error);

      return {
        successCount: 0,
        failureCount: tokensToSend.length,
        failedTokens: tokensToSend,
      };
    }
  }

  private isUnregisteredTokenError(errorCode: string): boolean {
    return [
      'messaging/registration-token-not-registered',
      'messaging/invalid-registration-token',
    ].includes(errorCode);
  }
}
