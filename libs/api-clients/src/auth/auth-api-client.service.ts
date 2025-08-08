import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import * as qs from 'qs';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

@Injectable()
export class AuthApiClientService implements OnModuleInit {
    private readonly logger = new Logger(AuthApiClientService.name);
    private m2mToken: string | null = null;
    private tokenExpiry: number | null = null;

    private readonly authServiceUrl: string;
    private readonly clientId: string;
    private readonly clientSecret: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.authServiceUrl = this.configService.get<string>('ACCOUNT_SERVICE_URL')!;
        this.clientId = this.configService.get<string>('SERVICE_CLIENT_ID')!;
        this.clientSecret = this.configService.get<string>('SERVICE_CLIENT_SECRET')!;

        if (!this.authServiceUrl || !this.clientId || !this.clientSecret) {
            throw new Error('M2M Auth client is not configured properly. Please check ACCOUNT_SERVICE_URL, SERVICE_CLIENT_ID, and SERVICE_CLIENT_SECRET environment variables.');
        }
    }

    async onModuleInit() {
        this.logger.log('Initializing M2M token with retry mechanism...');

        await this.getM2MTokenWithRetry(5, 3000);
    }

    async getM2MTokenWithRetry(retries: number, delayMs: number): Promise<string> {
        for (let i = 1; i <= retries; i++) {
            try {
                return await this.getM2MToken();
            } catch (error) {
                this.logger.warn(`Attempt ${i}/${retries} to get M2M token failed. Retrying in ${delayMs / 1000}s...`);
                if (i === retries) {
                    this.logger.error('All attempts to get M2M token failed.');
                    throw error;
                }
                await sleep(delayMs);
            }
        }

        throw new Error('Could not authenticate M2M client after all retries.');
    }


    async getM2MToken(): Promise<string> {
        if (this.m2mToken && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
            this.logger.debug('Returning cached M2M token.');
            return this.m2mToken;
        }
        this.logger.log('M2M token is expired or not available. Fetching a new one...');
        return this.authenticate();
    }

    private async authenticate(): Promise<string> {
        const url = `${this.authServiceUrl}/auth/token`;
        const data = qs.stringify({
            grant_type: 'client_credentials',
            client_id: this.clientId,
            client_secret: this.clientSecret,
        });

        this.logger.debug(`Attempting to authenticate M2M client. URL: ${url}, ClientID: ${this.clientId}`);

        try {
            const response = await firstValueFrom(
                this.httpService.post(url, data, {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    timeout: 10000,
                }),
            );

            this.m2mToken = response.data.accessToken;
            if(!this.m2mToken) {
                throw new Error("Invalid M2M token.");
            }
            this.tokenExpiry = Date.now() + (3600 * 1000);
            this.logger.log('Successfully fetched a new M2M token.');
            
            return this.m2mToken;
        } catch (error) {
            this.logger.error('Failed to fetch M2M token from Auth Service.');

            if (error.response) {
                this.logger.error(`- HTTP Status: ${error.response.status}`);
                this.logger.error(`- Response Data: ${JSON.stringify(error.response.data)}`);
            } 
            else if (error.request) {
                this.logger.error('- No response received from server. This is likely a network or DNS issue.');
                this.logger.error(`- Request was made to: ${error.config.url}`);
            } 
            else {
                this.logger.error(`- Error Message: ${error.message}`);
            }
            
            throw new Error('Could not authenticate M2M client.');
        }
    }
}