// apps/notification-service/src/firebase/firebase.service.ts (Đã nâng cấp)

import { Inject, Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { BatchResponse } from 'firebase-admin/lib/messaging/messaging-api';

/**
 * Định nghĩa một kiểu dữ liệu trả về rõ ràng cho kết quả gửi thông báo.
 */
export interface SendNotificationResult {
  successCount: number;
  failureCount: number;
  // Mảng chứa các token đã gửi thất bại.
  failedTokens: string[];
}

@Injectable()
export class FirebaseService {
  private readonly logger = new Logger(FirebaseService.name);

  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebaseAdmin: admin.app.App
  ) {}

  /**
   * Gửi thông báo đẩy đến một danh sách các token.
   * @returns Một object chứa kết quả chi tiết của việc gửi.
   */
  async sendPushNotification(
    tokens: string[], 
    title: string, 
    body: string, 
    data?: { [key: string]: string }
  ): Promise<SendNotificationResult> {
    if (!tokens || tokens.length === 0) {
      this.logger.warn('No FCM tokens provided. Skipping sending.');
      return { successCount: 0, failureCount: 0, failedTokens: [] };
    }

    // Firebase giới hạn 500 token mỗi lần gọi, chúng ta sẽ cắt mảng nếu cần.
    const tokensToSend = tokens.length > 500 ? tokens.slice(0, 500) : tokens;
    if (tokens.length > 500) {
        this.logger.warn(`Token count (${tokens.length}) exceeds 500. Only the first 500 will be used.`);
    }

    const message = {
      tokens: tokensToSend,
      notification: { title, body },
      data: data || {},
      android: { notification: { sound: 'default' } },
      apns: { payload: { aps: { sound: 'default' } } },
    };

    try {
      const response: BatchResponse = await this.firebaseAdmin.messaging().sendEachForMulticast(message);
      
      const failedTokens: string[] = [];
      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const failedToken = tokensToSend[idx];
            const errorCode = resp.error!.code;
            this.logger.error(`Failed to send to token [${failedToken}] with error: ${errorCode} - ${resp.error!.message}`);
            
            // Chỉ thêm vào danh sách xóa nếu lỗi là do token không hợp lệ
            if (this.isUnregisteredTokenError(errorCode)) {
              failedTokens.push(failedToken);
            }
          }
        });
      }
      
      this.logger.log(`FCM response: ${response.successCount} success, ${response.failureCount} failure.`);
      return {
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens,
      };
    } catch (error) {
      this.logger.error('Critical error during FCM sendEachForMulticast:', error);
      // Nếu toàn bộ request thất bại, coi như tất cả token đều thất bại
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