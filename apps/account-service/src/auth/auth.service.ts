import { TenantApiClientService } from '@app/api-clients/tenant/tenant-api-client.service';
import { AuthPayload, Role } from '@app/auth';
import { MetricName } from '@app/common/metrics/contracts/metrics.contracts';
import { ExchangeName } from '@app/common/rabbitmq/exchanges/exchanges';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { OutboxService } from '@app/outbox';
import { MailerService } from '@nestjs-modules/mailer';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { Counter } from 'prom-client';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { UserPayload } from '../users/dto/user.payload';
import { RefreshToken } from '../users/entities/refresh-token.entity';
import { UsersService } from '../users/users.service';
import { CreateServiceClientInput } from './dto/create-service-client.input';
import { GoogleLoginInput } from './dto/google-login.input';
import { LoginInputByEmail, LoginInputByPhoneNumber } from './dto/login.input';
import { LoginResponse } from './dto/login.response';
import { RegisterByEmailInput } from './dto/register.input';
import { RequestOtpResponse } from './dto/request-otp-response.dto';
import { VerifyEmailInput } from './dto/verify-email.input';
import { ServiceClient } from './entities/service-client.entity';
import { GOOGLE_OAUTH2_CLIENT } from './strategies/google/google.module';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,

        private readonly configService: ConfigService,

        @Inject(GOOGLE_OAUTH2_CLIENT) private readonly googleClient: OAuth2Client,

        private jwtService: JwtService,

        @InjectRepository(ServiceClient, 'authConnection') private serviceClientRepository: Repository<ServiceClient>,
        @InjectRepository(RefreshToken, 'accountConnection') private readonly refreshTokenRepo: Repository<RefreshToken>,

        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

        private readonly mailerService: MailerService,
        private readonly tenantApiClient: TenantApiClientService,

        private readonly outboxService: OutboxService,

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

                    return await this.buildLoginResponse(user);
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
                eventType: 'UserFirstLoginIdentity', 
                payload: { identity, userId: userPayload.id, externalHospitalCode },
                exchange: ExchangeName.USER_EVENTS,
                routingKey: RoutingKey.USER_FIRST_LOGIN_IDENTITY,
            });

            await this.outboxService.createOutboxMessage({
                aggregateType: 'auth',
                aggregateId: userPayload.id,
                eventType: 'UserFirstLoginScheduling',
                payload: { identity, hospitalUrl: hospital.graphqlEndpoint },
                exchange: ExchangeName.USER_EVENTS,
                routingKey: RoutingKey.USER_FIRST_LOGIN_SCHEDULING,
            });

            this.loginAttemptsCounter.inc({ login_method: 'phone', status: 'success' });

            return await this.buildLoginResponse(userPayload);
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
            return await this.buildLoginResponse(user);
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
            return await this.buildLoginResponse(user);
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

    async requestEmailVerification(registerInput: RegisterByEmailInput): Promise<RequestOtpResponse> {
        const { email } = registerInput;
        this.logger.log(`[OTP] Received verification request for email: ${email}`);

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await this.usersService.findByEmail(email);
        if (existingUser) {
            this.logger.warn(`[OTP] Email already registered: ${email}`);
            throw new ConflictException('Email này đã được sử dụng.');
        }

        // Kiểm tra retry count
        const retryKey = `otp:retry-count:verify-email:${email}`;
        const retryCount = (await this.cacheManager.get<number>(retryKey)) || 0;
        this.logger.log(`[OTP] Current retry count for ${email}: ${retryCount}`);

        if (retryCount >= 5) {
            this.logger.warn(`[OTP] Retry limit reached for ${email}`);
            throw new BadRequestException('Bạn đã yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau 1 giờ.');
        }

        // Cập nhật retry count (TTL 1 giờ)
        await this.cacheManager.set(retryKey, retryCount + 1, 3600);
        this.logger.log(`[OTP] Incremented retry count for ${email} to ${retryCount + 1}`);

        // Tạo OTP
        const otp = crypto.randomInt(1000, 9999).toString();
        const otpKey = `otp:verify-email:${email}`;
        const registrationData = { otp, attempts: 0, registerInput };

        // Lưu OTP trong cache (TTL 5 phút)
        await this.cacheManager.set(otpKey, JSON.stringify(registrationData), 300000);
        this.logger.log(`[OTP] Stored OTP in cache for ${email} with TTL 5 phút: ${otp}`);

        try {
            // Gửi email OTP
            await this.mailerService.sendMail({
                to: email,
                subject: `[MedPlusApp] Mã xác thực của bạn là ${otp}`,
                template: './verification',
                context: { otp },
            });
            this.logger.log(`[OTP] Sent verification OTP to ${email} successfully`);

            this.otpSentCounter.inc({ otp_channel: 'email', status: 'success' });

            return { success: true, message: 'OTP đã được gửi thành công.' };
        } catch (error) {
            this.registrationsCounter.inc({ login_method: 'email', status: 'failure' });
            this.otpSentCounter.inc({ otp_channel: 'email', status: 'failure' });

            this.logger.error(
                `[RequestEmailVerification] Failed to send OTP`,
                {
                    email,
                    reason: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                },
            );

            return { success: false, message: 'Không thể gửi OTP. Vui lòng thử lại sau.' };
        }
    }

    async verifyEmailAndRegister(verifyInput: VerifyEmailInput): Promise<LoginResponse> {
        const { email, otp } = verifyInput;

        try {
            const otpKey = `otp:verify-email:${email}`;
            this.logger.log(`Verifying OTP for email: ${email}`);

            const storedDataString = await this.cacheManager.get<string>(otpKey);

            if (!storedDataString) {
                throw new BadRequestException('OTP đã hết hạn hoặc không hợp lệ.');
            }

            const storedData = JSON.parse(storedDataString) as { otp: string, attempts: number, registerInput: RegisterByEmailInput };

            if (storedData.attempts >= 5) {
                await this.cacheManager.del(otpKey);
                throw new BadRequestException('Bạn đã nhập sai OTP quá 5 lần. Vui lòng yêu cầu OTP mới.');
            }

            if (storedData.otp !== otp) {
                storedData.attempts += 1;
                const remainingTTL = await (this.cacheManager.stores as any).ttl(otpKey);
                await this.cacheManager.set(otpKey, JSON.stringify(storedData), remainingTTL);
                throw new BadRequestException(`OTP không chính xác. Bạn còn ${5 - storedData.attempts} lần thử.`);
            }

            const { registerInput } = storedData;

            const newUser = await this.usersService.createUserByEmail({
                email: registerInput.email,
                password: registerInput.password,
            });

            await this.cacheManager.del(otpKey);
            const retryKey = `otp:retry-count:verify-email:${email}`;
            await this.cacheManager.del(retryKey);

            return await this.buildLoginResponse(newUser);
        } catch (error) {
            this.registrationsCounter.inc({ login_method: 'email', status: 'failure' });

            this.logger.error(
                `[VerifyEmailAndRegister] Failed to verify OTP or register user`,
                {
                    email,
                    reason: error instanceof Error ? error.message : 'Unknown error',
                    stack: error instanceof Error ? error.stack : undefined,
                },
            );

            throw error;
        }
    }

    private generateAccessToken(userId: string, roles: Role[]): string {
        const payload = { sub: userId, roles };
        const expiresIn = this.configService.get<string>('JWT_ACCESS_EXPIRES') || '1d';
        this.logger.debug(`Generating access token for userId=${userId}, expiresIn=${expiresIn}`);
        return this.jwtService.sign(payload, { expiresIn });
    }

    async generateRefreshToken(user: UserPayload, deviceInfo?: string, ipAddress?: string): Promise<string> {
        const token = uuid();
        const expiresInDays = this.configService.get<number>('JWT_REFRESH_DAYS') || 7;
        const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

        const refreshTokenEntity = this.refreshTokenRepo.create({
            token,
            user,
            deviceInfo,
            ipAddress,
            expiresAt,
            revoked: false,
        });
        await this.refreshTokenRepo.save(refreshTokenEntity);

        const redisKey = `refresh_token:${token}`;
        await this.cacheManager.set(redisKey, JSON.stringify({ userId: user.id, expiresAt }), expiresInDays * 24 * 60 * 60);

        this.logger.log(`Generated refresh token for userId=${user.id}, device=${deviceInfo || 'unknown'}, ip=${ipAddress || 'unknown'}`);
        return token;
    }

    async buildLoginResponse(user: UserPayload, deviceInfo?: string, ipAddress?: string) {
        const accessToken = this.generateAccessToken(user.id, user.roles);
        const refreshToken = await this.generateRefreshToken(user, deviceInfo, ipAddress);

        this.logger.log(`User ${user.id} login response built (access + refresh token)`);
        return { user, accessToken, refreshToken };
    }

    async refreshAccessToken(refreshToken: string, deviceInfo?: string, ipAddress?: string) {
        const redisKey = `refresh_token:${refreshToken}`;
        const cached = await this.cacheManager.get<string>(redisKey);

        if (!cached) {
            this.logger.warn(`Refresh token not found in Redis: ${refreshToken}`);
            throw new UnauthorizedException('Refresh token is invalid or expired');
        }

        const { userId, expiresAt } = JSON.parse(cached);

        if (new Date(expiresAt) < new Date()) {
            this.logger.warn(`Refresh token expired for userId=${userId}`);
            await this.markTokenRevoked(refreshToken);
            throw new UnauthorizedException('Refresh token expired');
        }

        const user = await this.usersService.findById(userId);
        if (!user) {
            this.logger.error(`User not found for refresh token: ${refreshToken}`);
            await this.markTokenRevoked(refreshToken);
            throw new UnauthorizedException('User not found');
        }

        const accessToken = this.generateAccessToken(user.id, user.roles);

        await this.markTokenRevoked(refreshToken);
        const newRefreshToken = await this.generateRefreshToken(user, deviceInfo, ipAddress);

        this.logger.log(`Refresh token rotated for userId=${userId}`);
        return { accessToken, refreshToken: newRefreshToken };
    }

    private async markTokenRevoked(token: string) {
        const redisKey = `refresh_token:${token}`;
        await this.refreshTokenRepo.update({ token }, { revoked: true });
        await this.cacheManager.del(redisKey);
        this.logger.debug(`Refresh token marked revoked and removed from Redis: ${token}`);
    }

    async logout(refreshToken: string, userId?: string) {
        const redisKey = `refresh_token:${refreshToken}`;
        await this.refreshTokenRepo.update({ token: refreshToken }, { revoked: true });
        await this.cacheManager.del(redisKey);

        this.logger.log(`User ${userId || 'unknown'} logged out, refresh token revoked: ${refreshToken}`);
    }

    generateM2MToken(client: ServiceClient): { accessToken: string } {
        const payload: AuthPayload = {
            sub: client.client_id,
            scopes: client.scopes,
        };
        return { accessToken: this.jwtService.sign(payload, { expiresIn: '1h' }) };
    }

    async createServiceClient(input: CreateServiceClientInput): Promise<Partial<ServiceClient>> {
        const newClient = this.serviceClientRepository.create(input);

        await this.serviceClientRepository.save(newClient);
        const { client_secret, ...res } = newClient;

        return res;
    }
}
