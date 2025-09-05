import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OrchestratorService {
  private readonly logger = new Logger(OrchestratorService.name);

  constructor(
    @Inject('BILLING_SERVICE_CLIENT') private readonly billingClient: ClientProxy,
    @Inject('NOTIFICATION_SERVICE_CLIENT') private readonly notificationClient: ClientProxy,
    // Có thể inject DB repo để lưu trạng thái saga
  ) {}

  async handleUserCreated(data: { userId: string; email: string }) {
    // Bước 1: tạo billing profile
    this.logger.log(`Sending CreateBillingProfile command for userId=${data.userId}`);
    this.billingClient.emit('CreateBillingProfile', { userId: data.userId });

    // Bước 2: gửi welcome email
    this.logger.log(`Sending SendWelcomeEmail command for email=${data.email}`);
    this.notificationClient.emit('SendWelcomeEmail', { email: data.email });

    // TODO: lưu trạng thái saga vào DB để sau này track success/failure
  }

  // Các phương thức xử lý event khác có thể tách riêng
  async handleBillingProfileCreated(payload: { userId: string }) {
    this.logger.log(`BillingProfile created for userId=${payload.userId}`);
    // cập nhật trạng thái saga, trigger next step nếu có
  }

  async handleWelcomeEmailSent(payload: { email: string }) {
    this.logger.log(`Welcome email sent to ${payload.email}`);
    // cập nhật trạng thái saga
  }
}
