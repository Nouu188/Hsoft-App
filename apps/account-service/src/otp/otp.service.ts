import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { OtpContext } from './enums/otp-context.enum';

interface OtpCacheData {
    otp: string;
    attempts: number;
    payload: any; // Dữ liệu đi kèm, ví dụ như registerInput
}

@Injectable()
export class OtpService {
    private readonly logger = new Logger(OtpService.name);
    private readonly OTP_MAX_ATTEMPTS = 5;
    private readonly OTP_RETRY_LIMIT = 5;

    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) { }

    async generateAndStoreOtp(
        context: OtpContext,
        identifier: string,
        payload: any,
        ttl = 300000, // 5 phút
    ): Promise<string> {
        // 1. Kiểm tra giới hạn yêu cầu OTP (rate limiting)
        await this.checkRequestLimit(context, identifier);

        // 2. Tạo OTP
        const otp = crypto.randomInt(100000, 999999).toString(); // Tăng lên 6 số cho an toàn hơn
        const otpKey = this._getOtpKey(context, identifier);
        const otpData: OtpCacheData = { otp, attempts: 0, payload };

        // 3. Lưu OTP vào cache
        await this.cacheManager.set(otpKey, JSON.stringify(otpData), ttl);
        this.logger.log(`[OTP] Stored OTP for ${context}:${identifier} with TTL ${ttl / 1000}s`);

        return otp;
    }

    /**
     * Xác thực một OTP.
     * @param context Mục đích của OTP
     * @param identifier Định danh duy nhất
     * @param otp OTP do người dùng cung cấp
     * @returns Dữ liệu payload đã được lưu trữ nếu OTP hợp lệ
     */
    async verifyOtp<T>(context: OtpContext, identifier: string, otp: string): Promise<T> {
        const otpKey = this._getOtpKey(context, identifier);
        const storedDataString = await this.cacheManager.get<string>(otpKey);

        if (!storedDataString) {
            throw new BadRequestException('OTP đã hết hạn hoặc không hợp lệ.');
        }

        const storedData: OtpCacheData = JSON.parse(storedDataString);

        // Kiểm tra số lần nhập sai
        if (storedData.attempts >= this.OTP_MAX_ATTEMPTS) {
            await this.cacheManager.del(otpKey);
            throw new BadRequestException(`Bạn đã nhập sai OTP quá ${this.OTP_MAX_ATTEMPTS} lần. Vui lòng yêu cầu OTP mới.`);
        }

        // So sánh OTP
        if (storedData.otp !== otp) {
            storedData.attempts += 1;
            const remainingTTL = await this._getRemainingTtl(otpKey);
            await this.cacheManager.set(otpKey, JSON.stringify(storedData), remainingTTL);
            throw new BadRequestException(`OTP không chính xác. Bạn còn ${this.OTP_MAX_ATTEMPTS - storedData.attempts} lần thử.`);
        }

        // Xác thực thành công
        return storedData.payload as T;
    }

    /**
     * Xóa OTP và các key liên quan sau khi đã sử dụng thành công.
     */
    async invalidateOtp(context: OtpContext, identifier: string): Promise<void> {
        await this.cacheManager.del(this._getOtpKey(context, identifier));
        await this.cacheManager.del(this._getRetryKey(context, identifier));
        this.logger.log(`[OTP] Invalidated OTP data for ${context}:${identifier}`);
    }

    // --- Các phương thức private helper ---

    private async checkRequestLimit(context: OtpContext, identifier: string): Promise<void> {
        const retryKey = this._getRetryKey(context, identifier);
        const retryCount = (await this.cacheManager.get<number>(retryKey)) || 0;

        if (retryCount >= this.OTP_RETRY_LIMIT) {
            this.logger.warn(`[OTP] Request limit reached for ${context}:${identifier}`);
            throw new BadRequestException('Bạn đã yêu cầu OTP quá nhiều lần. Vui lòng thử lại sau 1 giờ.');
        }

        // Tăng bộ đếm và đặt TTL là 1 giờ (3600 giây)
        await this.cacheManager.set(retryKey, retryCount + 1, 3600 * 1000);
    }

    private _getOtpKey(context: OtpContext, identifier: string): string {
        return `otp:${context}:${identifier}`;
    }

    private _getRetryKey(context: OtpContext, identifier: string): string {
        return `otp:retry:${context}:${identifier}`;
    }

    private async _getRemainingTtl(key: string): Promise<number> {
        // Thư viện cache-manager v5 không có `ttl` trực tiếp, cần workaround
        if (typeof (this.cacheManager.stores as any).ttl === 'function') {
            return (this.cacheManager.stores as any).ttl(key);
        }
        // Giá trị fallback nếu không lấy được TTL
        return 300000;
    }
}