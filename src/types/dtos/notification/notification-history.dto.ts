import { NotificationStatus } from "@/types/enums/notification-status.enum";
import { NotificationType } from "@/types/enums/notification-type.enum";

/**
 * Đại diện cho một bản ghi lịch sử thông báo,
 * phản ánh cấu trúc dữ liệu từ notification-service.
 */
export interface NotificationHistory {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  status: NotificationStatus;
  payload: {
    // Định nghĩa các payload có thể có
    doseIds?: string[];
    appointmentId?: string;
    resultId?: string;
    paymentId?: string;
    [key: string]: any; // Cho phép các key khác
  };
  sentAt: string; // ISO 8601 timestamp
  createdAt: string; // ISO 8601 timestamp
}