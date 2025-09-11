import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OtpContext } from 'apps/account-service/src/infrastructure/common/enums/otp-context.enum';
import { OtpService } from 'apps/account-service/src/infrastructure/common/services/otp.service';
import { VerifyPasswordResetResponse } from 'apps/account-service/src/presentation/graphql/resolvers/auth/dtos/password-reset/password-reset.response';
import { VerifyPasswordResetCommand } from '../../impl/password-reset/verify-password-reset.command';

@CommandHandler(VerifyPasswordResetCommand)
export class VerifyPasswordResetHandler implements ICommandHandler<VerifyPasswordResetCommand, VerifyPasswordResetResponse> {
    private readonly logger = new Logger(VerifyPasswordResetHandler.name);
    
    constructor(
        private readonly otpService: OtpService,
    ) { }

    async execute(command: VerifyPasswordResetCommand): Promise<VerifyPasswordResetResponse> {
        const { email, otp } = command.input;
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
}
