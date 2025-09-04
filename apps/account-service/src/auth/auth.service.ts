import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';
import { TenantApiClientService } from '@app/api-clients/tenant/tenant-api-client.service';
import { RoutingKey } from '@app/common/rabbitmq/routing-keys';
import { ExchangeName } from '@app/common/rabbitmq/exchanges/exchanges';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { MailerService } from '@nestjs-modules/mailer';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateIdentityInput } from 'apps/tenant-management-service/src/identities/dtos/create-identity-input.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { Repository } from 'typeorm';
import { AuthPayload } from '../../../../libs/auth/src/dtos/auth.payload';
import { Role } from '../../../../libs/auth/src/enums/role.enum';
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
import { normalizeHospitalPatient } from 'libs/normalizers/src/lib/normalize-hospital-patient';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private usersService: UsersService,

        private readonly configService: ConfigService,

        @Inject(GOOGLE_OAUTH2_CLIENT) private readonly googleClient: OAuth2Client,

        private jwtService: JwtService,

        private readonly amqpConnection: AmqpConnection,

        @InjectRepository(ServiceClient, 'authConnection') private serviceClientRepository: Repository<ServiceClient>,

        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,

        private readonly mailerService: MailerService,
        private readonly tenantApiClient: TenantApiClientService,
        private readonly hospitalClient: HospitalApiClientService,
    ) { }

    async loginByPhoneNumber(loginInput: LoginInputByPhoneNumber): Promise<LoginResponse> {
        const { phoneNumber, password, externalHospitalCode } = loginInput;
        if (!phoneNumber && !password) {
            throw new ConflictException("Invalid input");
        }

        let user = await this.usersService.findByPhoneNumber(phoneNumber);
        if (user) {
            if (!user.password) {
                throw new UnauthorizedException('Password not set for this user.');
            }

            const isPasswordMatching = await bcrypt.compare(password!, user.password);
            if (isPasswordMatching) {
                this.logger.log(`User ${user.phoneNumber} logged in from internal DB.`);

                const accessToken = this.generateToken(user.id, user.roles);

                return { user, accessToken };
            }

            throw new UnauthorizedException("Invalid credentials");
        }

        this.logger.log(`User with phoneNumber "${phoneNumber}" not found. Attempting to fetch from hospital API...`);

        const hospital = await this.tenantApiClient.getHospitalByCode(externalHospitalCode);
        console.log(hospital)

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
        this.amqpConnection.publish(
            ExchangeName.USER_EVENTS,
            RoutingKey.USER_FIRST_LOGIN_IDENTITY,
            { 
                identity: identity,
                userId: userPayload.id,
                externalHospitalCode: externalHospitalCode,
            },
        );

        this.amqpConnection.publish(
            ExchangeName.USER_EVENTS,
            RoutingKey.USER_FIRST_LOGIN_SCHEDULING,
            {
                identity: identity,
                hospitalUrl: hospital.graphqlEndpoint
            },
        );

        const accessToken = this.generateToken(userPayload.id, userPayload.roles);

        return { accessToken, user: userPayload }
    }

    async loginByEmail(loginInput: LoginInputByEmail): Promise<LoginResponse> {
        const { email, password } = loginInput;
        if (!email && !password) {
            this.logger.warn('Login attempt with missing email or password');
            throw new ConflictException('Email and password are required');
        }

        this.logger.debug(`Login attempt for email: ${email}`);

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

        const accessToken = this.generateToken(user.id, user.roles);

        const { password: _, ...userResult } = user;

        return { user: userResult, accessToken };
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
            // TODO: Phát sự kiện 'user.registered' nếu cần

            // 3. Tạo và trả về token của hệ thống
            const accessToken = this.generateToken(user.id, user.roles);

            this.logger.log(`Successfully authenticated user ${user.id} via Google.`);
            return { user, accessToken };

        } catch (error) {
            this.logger.error('Failed to authenticate with Google.', error.stack);
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
            return { success: true, message: 'OTP đã được gửi thành công.' };
        } catch (error) {
            this.logger.error(`[OTP] Failed to send OTP to ${email}: ${error.message}`, error.stack);
            return { success: false, message: 'Không thể gửi OTP. Vui lòng thử lại sau.' };
        }
    }

    async verifyEmailAndRegister(verifyInput: VerifyEmailInput): Promise<LoginResponse> {
        const { email, otp } = verifyInput;
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

        const accessToken = this.generateToken(newUser.id, newUser.roles);

        return { user: newUser, accessToken };
    }

    private generateToken(userId: string, roles: Role[]): string {
        const payload: AuthPayload = {
            sub: userId,
            roles,
        };

        return this.jwtService.sign(payload);
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
