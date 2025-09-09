import { ExchangeName } from '@app/common/rabbitmq/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { OutboxService } from '@app/outbox';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { OtpContext } from 'apps/account-service/src/otp/enums/otp-context.enum';
import { OtpService } from 'apps/account-service/src/otp/otp.service';
import { TokenService } from 'apps/account-service/src/tokens/tokens.service';
import { UsersService } from '../../../../users/users.service';
import { RegisterByEmailInput } from '../../../dto/registration/register.input';
import { VerifyEmailInput } from '../../../dto/registration/verify-email.input';
import { RequestOtpResponse } from '../../../dto/request-otp-response.dto';
import { IRegistrationStrategy } from '../interfaces/registration.provider';
import { LoginResponse } from '../../../dto/login/login.response';

@Injectable()
export class EmailRegistrationProvider implements IRegistrationStrategy<RegisterByEmailInput, VerifyEmailInput> {
    private readonly logger = new Logger(EmailRegistrationProvider.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly otpService: OtpService,
        private readonly outboxService: OutboxService,
        private readonly tokenService: TokenService,
    ) { }

    async initiate(input: RegisterByEmailInput): Promise<RequestOtpResponse> {
        const { email } = input;
        this.logger.log(`Initiating email registration for: ${email}`);

        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('Email này đã được sử dụng.');
        }

        const otp = await this.otpService.generateAndStoreOtp(
            OtpContext.EMAIL_VERIFICATION,
            email,
            input,
        );

        const commandPayload = {
            to: email,
            subject: `[MedPlusApp] Mã xác thực của bạn là ${otp}`,
            template: 'verification',
            context: { otp },
            history: {
                type: 'EMAIL_VERIFICATION_OTP',
                title: 'Xác thực email đăng ký',
                body: `Mã OTP của bạn là: ${otp}`,
            }
        };

        await this.outboxService.createOutboxMessage({
            aggregateType: 'auth',
            aggregateId: email,
            eventType: 'SEND_TRANSACTIONAL_EMAIL_COMMAND',
            payload: commandPayload,
            exchange: ExchangeName.COMMANDS,
            routingKey: RoutingKey.SEND_TRANSACTIONAL_EMAIL_COMMAND,
        });

        this.logger.log(`Queued email OTP command for ${email}`);
        return { success: true, message: 'OTP đã được gửi thành công.' };
    }

    async complete(input: VerifyEmailInput): Promise<LoginResponse> {
        const { email, otp } = input;
        this.logger.log(`Completing email registration for: ${email}`);

        const registerInput = await this.otpService.verifyOtp<RegisterByEmailInput>(
            OtpContext.EMAIL_VERIFICATION,
            email,
            otp,
        );

        const newUser = await this.usersService.createUserByEmail({
            email: registerInput.email,
            password: registerInput.password,
        });

        await this.otpService.invalidateOtp(OtpContext.EMAIL_VERIFICATION, email);

        const tokenPair = await this.tokenService.generateTokenPair(newUser);

        this.logger.log(`Registration successful for user ${newUser.id}`);
        return { user: newUser, ...tokenPair };
    }
}