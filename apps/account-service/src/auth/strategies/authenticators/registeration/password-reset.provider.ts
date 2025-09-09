import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { OutboxService } from '@app/outbox';
import { Injectable, Logger } from '@nestjs/common';
import { OtpContext } from 'apps/account-service/src/otp/enums/otp-context.enum';
import { OtpService } from 'apps/account-service/src/otp/otp.service';
import { TokenService } from 'apps/account-service/src/tokens/tokens.service';
import { UsersService } from '../../../../users/users.service';
import { LoginResponse } from '../../../dto/login/login.response';
import { ConfirmPasswordResetInput, RequestPasswordResetInput, VerifyPasswordResetInput } from '../../../dto/password-reset/password-reset.input';
import { RequestPasswordResetResponse, VerifyPasswordResetResponse } from '../../../dto/password-reset/password-reset.response';

@Injectable()
export class PasswordResetProvider {
    private readonly logger = new Logger(PasswordResetProvider.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly otpService: OtpService,
        private readonly outboxService: OutboxService,
        private readonly tokenService: TokenService,
    ) { }

    async request(input: RequestPasswordResetInput): Promise<RequestPasswordResetResponse> {
        const { email } = input;
        this.logger.log(`Password reset requested for email: ${email}`);

        const user = await this.usersService.findByEmail(email);
        if (!user) {
            this.logger.warn(`Password reset requested for non-existent email: ${email}`);
            return { success: true, message: 'Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một mã khôi phục.' };
        }

        const otp = await this.otpService.generateAndStoreOtp(OtpContext.PASSWORD_RESET, email, { userId: user.id });

        await this.outboxService.createOutboxMessage({
            aggregateType: 'auth',
            aggregateId: user.id,
            eventType: 'SEND_TRANSACTIONAL_EMAIL_COMMAND',
            payload: {
                to: email,
                subject: '[MedPlusApp] Yêu cầu đặt lại mật khẩu',
                template: 'password-reset',
                context: { otp },
                history: {
                    type: 'PASSWORD_RESET_OTP',
                    title: 'Xác thực email đăng ký',
                    body: `Mã OTP của bạn là: ${otp}`,
                }
            },
            exchange: ExchangeName.COMMANDS,
            routingKey: RoutingKey.SEND_TRANSACTIONAL_EMAIL_COMMAND,
        });

        this.logger.log(`Queued password reset OTP for email: ${email}`);
        return { success: true, message: 'Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một mã khôi phục.' };
    }

    async verify(input: VerifyPasswordResetInput): Promise<VerifyPasswordResetResponse> {
        const { email, otp } = input;
        this.logger.log(`Verifying password reset OTP for: ${email}`);

        const { userId } = await this.otpService.verifyOtp<{ userId: string }>(OtpContext.PASSWORD_RESET, email, otp);

        await this.otpService.invalidateOtp(OtpContext.PASSWORD_RESET, email);

        const resetToken = await this.otpService.generateOneTimeToken(
            OtpContext.PASSWORD_RESET,
            email,
            { userId },
        );

        this.logger.log(`Password reset OTP verified for userId: ${userId}. Issued one-time reset token.`);
        return { success: true, resetToken };
    }

    async confirm(input: ConfirmPasswordResetInput): Promise<LoginResponse> {
        const { email, resetToken, newPassword } = input;
        this.logger.log(`Confirming new password for: ${email}`);

        const { userId } = await this.otpService.verifyAndConsumeOneTimeToken<{ userId: string }>(
            OtpContext.PASSWORD_RESET,
            email,
            resetToken,
        );

        const updatedUser = await this.usersService.updatePasswordByUserId(userId, newPassword);

        this.logger.log(`Password for user ${updatedUser.id} has been reset successfully.`);

        const tokenPair = await this.tokenService.generateTokenPair(updatedUser);
        return { user: updatedUser, ...tokenPair };
    }
}