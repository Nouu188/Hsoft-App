import { TenantApiClientService } from '@app/api-clients/tenant/tenant-api-client.service';
import { MetricName } from '@app/common/metrics/contracts/metrics.contracts';
import { ExchangeName } from '@app/common/rabbitmq/exchanges/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { OutboxService } from '@app/outbox';
import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { Counter } from 'prom-client';
import { OtpContext } from '../otp/enums/otp-context.enum';
import { OtpService } from '../otp/otp.service';
import { TokenService } from '../tokens/tokens.service';
import { UsersService } from '../users/users.service';
import { GoogleLoginInput } from './dto/google-login.input';
import { LoginInputByEmail, LoginInputByPhoneNumber } from './dto/login.input';
import { LoginResponse } from './dto/login.response';
import { RegisterByEmailInput } from './dto/register.input';
import { RequestOtpResponse } from './dto/request-otp-response.dto';
import { VerifyEmailInput } from './dto/verify-email.input';
import { GOOGLE_OAUTH2_CLIENT } from './strategies/google/google.module';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,

        private readonly configService: ConfigService,

        @Inject(GOOGLE_OAUTH2_CLIENT) private readonly googleClient: OAuth2Client,

        private readonly mailerService: MailerService,
        private readonly tenantApiClient: TenantApiClientService,

        private readonly outboxService: OutboxService,
        private readonly otpService: OtpService,
        private readonly tokenService: TokenService,

        @InjectMetric(MetricName.AUTH_LOGIN_ATTEMPTS_TOTAL)
        private readonly loginAttemptsCounter: Counter<string>,

        @InjectMetric(MetricName.AUTH_REGISTRATIONS_TOTAL)
        private readonly registrationsCounter: Counter<string>,

        @InjectMetric(MetricName.AUTH_OTP_SENT_TOTAL)
        private readonly otpSentCounter: Counter<string>,
    ) { }

    async loginByPhoneNumber(loginInput: LoginInputByPhoneNumber): Promise<LoginResponse> {
        const { phoneNumber, password, externalHospitalCode } = loginInput;
        if (!phoneNumber && !password) {
            throw new ConflictException("Invalid input");
        }

        try {
            let user = await this.usersService.findByPhoneNumber(phoneNumber);
            if (user) {
                if (!user.password) {
                    throw new UnauthorizedException('Password not set for this user.');
                }

                const isPasswordMatching = await bcrypt.compare(password!, user.password);
                if (isPasswordMatching) {
                    this.logger.log(`User ${user.phoneNumber} logged in from internal DB.`);

                    const tokenPair = await this.tokenService.generateTokenPair(user);
                    return { user, ...tokenPair };
                }

                throw new UnauthorizedException("Invalid credentials");
            }

            this.logger.log(`User with phoneNumber "${phoneNumber}" not found. Attempting to fetch from hospital API...`);

            const hospital = await this.tenantApiClient.getHospitalByCode(externalHospitalCode);

            const identity = await this.tenantApiClient.fetchIdentityFromHospital(phoneNumber, externalHospitalCode);
            if (!identity) {
                throw new UnauthorizedException('Patient information not found in hospital system.');
            }

            const birthYear = identity.birthYear;
            if (!birthYear) {
                throw new UnauthorizedException('Birth year not set for this user.');
            }

            if (loginInput.password !== birthYear.toString()) {
                throw new UnauthorizedException('Invalid credentials.');
            }

            this.logger.log(`First-time login successful for phone ${identity.phoneNumber}. Creating local user...`);
            const userPayload = await this.usersService.createUserFromHospital(identity);

            this.logger.log(`Publishing 'user.first_login' event for user ${identity.phoneNumber}`);
            await this.outboxService.createOutboxMessage({
                aggregateType: 'auth',
                aggregateId: userPayload.id,
                eventType: 'UserFirstLoginSagaInitiated',
                payload: { identity, userId: userPayload.id, externalHospitalCode, hospitalUrl: hospital.graphqlEndpoint },
                exchange: ExchangeName.USER_EVENTS,
                routingKey: RoutingKey.USER_FIRST_LOGIN_SAGA_INITIATED,
            });

            this.loginAttemptsCounter.inc({ login_method: 'phone', status: 'success' });

            const tokenPair = await this.tokenService.generateTokenPair(userPayload);
            return { user: userPayload, ...tokenPair };
        } catch (error) {
            this.loginAttemptsCounter.inc({ login_method: 'phone', status: 'failure' });

            this.logger.error(
                `[LoginByPhoneNumber] Failed login attempt`,
                {
                    phoneNumber,
                    externalHospitalCode,
                    reason: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                },
            );

            throw error;
        }
    }

    async loginByEmail(loginInput: LoginInputByEmail): Promise<LoginResponse> {
        const { email, password } = loginInput;
        if (!email && !password) {
            this.logger.warn('Login attempt with missing email or password');
            throw new ConflictException('Email and password are required');
        }

        this.logger.debug(`Login attempt for email: ${email}`);

        try {
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                this.logger.warn(`Login failed: User with email ${email} not found`);
                throw new UnauthorizedException('Invalid email or password');
            }

            if (!user.password) {
                throw new UnauthorizedException('Password not set for this user.');
            }

            const isPasswordValid = await bcrypt.compare(password as string, user.password);
            if (!isPasswordValid) {
                this.logger.warn(`Login failed: Invalid password for email ${email}`);
                throw new UnauthorizedException('Invalid email or password');
            }

            this.logger.log(`Login successful for email: ${email}`);

            this.loginAttemptsCounter.inc({ login_method: 'email', status: 'success' });

            const tokenPair = await this.tokenService.generateTokenPair(user);
            return { user, ...tokenPair };
        } catch (error) {
            this.loginAttemptsCounter.inc({ login_method: 'email', status: 'failure' });

            this.logger.error(
                `[LoginByEmail] Login failed`,
                {
                    email,
                    reason: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                },
            );

            throw error;
        }
    }

    async loginWithGoogle(googleLoginInput: GoogleLoginInput): Promise<LoginResponse> {
        const { idToken } = googleLoginInput;
        this.logger.log('Attempting to log in with Google ID Token.');

        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: idToken,
                audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
            });

            const payload = ticket.getPayload();
            if (!payload || !payload.email) {
                throw new UnauthorizedException('Invalid Google token or email not provided.');
            }

            const { email, name, picture, sub: googleId } = payload;
            this.logger.log(`Google token verified for email: ${email}`);

            const user = await this.usersService.findOrCreateFromGoogle({
                email,
                fullName: name,
                avatarUrl: picture,
                googleId,
            });
            this.logger.log(`Successfully authenticated user ${user.id} via Google.`);

            this.loginAttemptsCounter.inc({ login_method: 'google', status: 'success' });

            const tokenPair = await this.tokenService.generateTokenPair(user);
            return { user, ...tokenPair };
        } catch (error) {
            this.otpSentCounter.inc({ otp_channel: 'email', status: 'failure' });

            this.logger.error(
                `[LoginWithGoogle] Google authentication failed`,
                {
                    reason: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                },
            );

            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('An error occurred during Google authentication.');
        }
    }

    async registerByEmail(registerInput: RegisterByEmailInput): Promise<RequestOtpResponse> {
        const { email } = registerInput;
        this.logger.log(`Processing email verification request for: ${email}`);

        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            throw new ConflictException('Email này đã được sử dụng.');
        }

        try {
            const otp = await this.otpService.generateAndStoreOtp(
                OtpContext.EMAIL_VERIFICATION,
                email,
                registerInput,
            );

            await this.mailerService.sendMail({
                to: email,
                subject: `[MedPlusApp] Mã xác thực của bạn là ${otp}`,
                template: './verification',
                context: { otp },
            });
            this.logger.log(`Sent verification OTP to ${email} successfully`);

            this.otpSentCounter.inc({ otp_channel: 'email', status: 'success' });
            return { success: true, message: 'OTP đã được gửi thành công.' };
        } catch (error) {
            this.otpSentCounter.inc({ otp_channel: 'email', status: 'failure' });
            this.logger.error(`Failed to send OTP for ${email}`, error.stack);

            if (error instanceof BadRequestException) throw error;

            return { success: false, message: 'Không thể gửi OTP. Vui lòng thử lại sau.' };
        }
    }

    async verifyEmailAndRegister(verifyInput: VerifyEmailInput): Promise<LoginResponse> {
        const { email, otp } = verifyInput;
        this.logger.log(`Verifying OTP for email registration: ${email}`);

        try {
            const registerInput = await this.otpService.verifyOtp<RegisterByEmailInput>(
                OtpContext.EMAIL_VERIFICATION,
                email,
                otp,
            );

            const newUser = await this.usersService.createUserByEmail({
                email: registerInput.email,
                password: registerInput.password,
            });
            this.registrationsCounter.inc({ login_method: 'email', status: 'success' });

            await this.otpService.invalidateOtp(OtpContext.EMAIL_VERIFICATION, email);

            const tokenPair = await this.tokenService.generateTokenPair(newUser);
            return { user: newUser, ...tokenPair };
        } catch (error) {
            this.registrationsCounter.inc({ login_method: 'email', status: 'failure' });
            this.logger.error(`Failed to verify OTP or register user for ${email}`, error.stack);
            throw error;
        }
    }
    
    async logout(refreshToken: string): Promise<void> {
        await this.tokenService.revokeRefreshToken(refreshToken);
        this.logger.log(`User logged out, refresh token revoked.`);
    }
}
