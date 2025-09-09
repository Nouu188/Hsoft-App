import { MetricName } from '@app/common/metrics/contracts/metrics.contracts';
import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';
import { TokenService } from '../tokens/tokens.service';
import { GoogleLoginInput } from './dto/login/google-login.input';
import { LoginInputByEmail, LoginInputByPhoneNumber } from './dto/login/login.input';
import { RegisterByEmailInput } from './dto/registration/register.input';
import { RequestOtpResponse } from './dto/request-otp-response.dto';
import { VerifyEmailInput } from './dto/registration/verify-email.input';
import { EmailAuthenticationProvider } from './strategies/authenticators/login/email-authentication.provider';
import { EmailRegistrationProvider } from './strategies/authenticators/registeration/email-registration.provider';
import { GoogleAuthenticationProvider } from './strategies/authenticators/login/google-authentication.provider';
import { ILoginStrategy } from './strategies/authenticators/interfaces/authentication.provider';
import { PhoneNumberAuthenticationProvider } from './strategies/authenticators/login/phone-authentication.provider';
import { ConfirmPasswordResetInput, RequestPasswordResetInput, VerifyPasswordResetInput } from './dto/password-reset/password-reset.input';
import { RequestPasswordResetResponse, VerifyPasswordResetResponse } from './dto/password-reset/password-reset.response';
import { PasswordResetProvider } from './strategies/authenticators/registeration/password-reset.provider';
import { LoginResponse } from './dto/login/login.response';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly emailAuthenticationProvider: EmailAuthenticationProvider,
        private readonly googleAuthenticationProvider: GoogleAuthenticationProvider,
        private readonly phoneNumberAuthenticationProvider: PhoneNumberAuthenticationProvider,
        private readonly emailRegistrationProvider: EmailRegistrationProvider,
        private readonly passwordResetProvider: PasswordResetProvider,

        private readonly tokenService: TokenService,

        @InjectMetric(MetricName.AUTH_LOGIN_ATTEMPTS_TOTAL)
        private readonly loginAttemptsCounter: Counter<string>,

        @InjectMetric(MetricName.AUTH_REGISTRATIONS_TOTAL)
        private readonly registrationsCounter: Counter<string>,

        @InjectMetric(MetricName.AUTH_OTP_SENT_TOTAL)
        private readonly otpSentCounter: Counter<string>,
    ) { }

    // --- Login Handler ---

    async loginByPhoneNumber(loginInput: LoginInputByPhoneNumber): Promise<LoginResponse> {
        return this._loginWithStrategy(this.phoneNumberAuthenticationProvider, loginInput, 'phone');
    }

    async loginByEmail(loginInput: LoginInputByEmail): Promise<LoginResponse> {
        return this._loginWithStrategy(this.emailAuthenticationProvider, loginInput, 'email');
    }

    async loginWithGoogle(loginInput: GoogleLoginInput): Promise<LoginResponse> {
        return this._loginWithStrategy(this.googleAuthenticationProvider, loginInput, 'google');
    }

    // --- PASSWORD RESET METHODS ---

    async requestPasswordReset(input: RequestPasswordResetInput): Promise<RequestPasswordResetResponse> {
        return this.passwordResetProvider.request(input);
    }

    async verifyPasswordReset(input: VerifyPasswordResetInput): Promise<VerifyPasswordResetResponse> {
        return this.passwordResetProvider.verify(input);
    }

    async confirmNewPassword(input: ConfirmPasswordResetInput): Promise<LoginResponse> {
        return this.passwordResetProvider.confirm(input);
    }

    // --- Email Registration ---

    async initiateEmailRegistration(registerInput: RegisterByEmailInput): Promise<RequestOtpResponse> {
        try {
            const response = await this.emailRegistrationProvider.initiate(registerInput);

            this.otpSentCounter.inc({ otp_channel: 'email', status: 'success' });
            return response;
        } catch (error) {
            this.otpSentCounter.inc({ otp_channel: 'email', status: 'failure' });
            this.logger.error(`Failed to initiate email registration for ${registerInput.email}`, error.stack);

            if (error instanceof BadRequestException || error instanceof ConflictException) throw error;
            throw new InternalServerErrorException('Could not initiate registration.');
        }
    }

    async completeEmailRegistration(verifyInput: VerifyEmailInput): Promise<LoginResponse> {
        try {
            const response = await this.emailRegistrationProvider.complete(verifyInput);

            this.registrationsCounter.inc({ login_method: 'email', status: 'success' });
            return response;
        } catch (error) {
            this.registrationsCounter.inc({ login_method: 'email', status: 'failure' });
            this.logger.error(`Failed to complete email registration for ${verifyInput.email}`, error.stack);

            throw error;
        }
    }

    // --- LogOut ---

    async logout(refreshToken: string): Promise<void> {
        await this.tokenService.revokeRefreshToken(refreshToken);
        this.logger.log(`User logged out, refresh token revoked.`);
    }

    // --- PRIVATE-HELPER ---

    private async _loginWithStrategy<T>(
        strategy: ILoginStrategy<T>,
        input: T,
        method: 'phone' | 'email' | 'google'
    ): Promise<LoginResponse> {
        try {
            this.logger.debug(`Attempting login via ${method} strategy.`);
            const user = await strategy.authenticate(input);

            const tokenPair = await this.tokenService.generateTokenPair(user);

            this.loginAttemptsCounter.inc({ login_method: method, status: 'success' });
            this.logger.log(`Login successful for user ${user.id} via ${method}.`);

            return { user, ...tokenPair };
        } catch (error) {
            this.loginAttemptsCounter.inc({ login_method: method, status: 'failure' });

            if (error instanceof UnauthorizedException) {
                this.logger.warn(`Login failed via ${method}: ${error.message}`);
            } else {
                this.logger.error(`An unexpected error occurred during ${method} login`, error.stack);
            }

            throw error;
        }
    }
}
