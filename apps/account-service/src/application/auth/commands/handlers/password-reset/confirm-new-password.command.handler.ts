import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IUserRepository } from 'apps/account-service/src/domain/users/interfaces/user.repository.interface';
import { OtpContext } from 'apps/account-service/src/infrastructure/common/enums/otp-context.enum';
import { AccountTransactionService } from 'apps/account-service/src/infrastructure/common/services';
import { OtpService } from 'apps/account-service/src/infrastructure/common/services/otp.service';
import { TokenService } from 'apps/account-service/src/infrastructure/common/services/token.service';
import { LoginResponse } from 'apps/account-service/src/presentation/graphql/resolvers/auth/dtos/login/login.response';
import { ConfirmNewPasswordCommand } from '../../impl/password-reset/confirm-new-password.command';

@CommandHandler(ConfirmNewPasswordCommand)
export class ConfirmNewPasswordHandler implements ICommandHandler<ConfirmNewPasswordCommand, LoginResponse> {
    private readonly logger = new Logger(ConfirmNewPasswordHandler.name);

    constructor(
        @Inject(IUserRepository) private readonly userRepository: IUserRepository,
        private readonly otpService: OtpService,
        private readonly tokenService: TokenService,
        private readonly transactionService: AccountTransactionService,
    ) { }

    async execute(command: ConfirmNewPasswordCommand): Promise<LoginResponse> {
        return this.transactionService.execute(async (manager) => {
            const { email, resetToken, newPassword } = command.input;
            this.logger.log(`Confirming new password for: ${email}`);

            const { userId } = await this.otpService.verifyAndConsumeOneTimeToken<{ userId: string }>(
                OtpContext.PASSWORD_RESET,
                email,
                resetToken,
            );

            const updatedUser = await this.userRepository.updatePasswordByUserId(userId, newPassword, manager);

            this.logger.log(`Password for user ${updatedUser.id} has been reset successfully.`);

            const tokenPair = await this.tokenService.generateTokenPair(updatedUser);
            return { user: updatedUser, ...tokenPair };
        });
    }
}
