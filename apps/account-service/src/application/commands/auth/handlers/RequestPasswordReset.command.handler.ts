import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { OutboxService } from '@app/outbox';
import { OutboxEntity } from '@app/outbox/entities/outbox.entity';
import { Inject, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserRepository } from 'apps/account-service/src/domain/users/interfaces/user.repository.interface';
import { OtpContext } from 'apps/account-service/src/infrastructure/common/enums/otp-context.enum';
import { AccountTransactionService } from 'apps/account-service/src/infrastructure/common/services';
import { OtpService } from 'apps/account-service/src/infrastructure/common/services/otp.service';
import { RequestPasswordResetResponse } from 'apps/account-service/src/presentation/graphql/resolvers/auth/dtos/password-reset/password-reset.response';
import { RequestPasswordResetCommand } from '../RequestPasswordReset.command';

@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler implements ICommandHandler<RequestPasswordResetCommand, RequestPasswordResetResponse> {
    private readonly logger = new Logger(RequestPasswordResetHandler.name);

    constructor(
        @Inject(IUserRepository) private readonly userRepository: IUserRepository,
        @Inject('OutboxService_authConnection') private readonly outboxService: OutboxService,
        private readonly otpService: OtpService,
        private readonly transactionService: AccountTransactionService,
    ) { }

    async execute(command: RequestPasswordResetCommand): Promise<RequestPasswordResetResponse> {
        const { email } = command.input;
        this.logger.log(`Password reset requested for email: ${email}`);

        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            this.logger.warn(`Password reset requested for non-existent email: ${email}`);
            return { success: true, message: 'Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một mã khôi phục.' };
        }

        return this.transactionService.execute(async (manager) => {
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
            }, manager);

            this.logger.log(`Queued password reset OTP for email: ${email}`);
            return { success: true, message: 'Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được một mã khôi phục.' };
        })
    }
}
