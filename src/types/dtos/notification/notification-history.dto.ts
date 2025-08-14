import { NotificationStatus } from "@/types/enums/notification-status.enum";
import { NotificationType } from "@/types/enums/notification-type.enum";

export interface NotificationHistory {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  status: NotificationStatus;
  payload: {
    doseIds?: string[];
    appointmentId?: string;
    resultId?: string;
    paymentId?: string;
    [key: string]: any; // Cho phép các key khác
  };
  sentAt: string;
  createdAt: string;
}