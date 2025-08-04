import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';
import { User } from 'apps/account-service/src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { YLenhThuoc } from './dto/ylenhthuoc.dto';
import { HospitalPatient } from './dto/hospitalPatient.dto';

@Injectable()
export class HospitalApiClientService {
    private readonly logger = new Logger(HospitalApiClientService.name);
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async fetchYLenhThuoc(user: User, date: string): Promise<YLenhThuoc[]> {
        if(!user.sodienthoai && !user.socmnd && !user.mabn) {
            throw new Error('Either "mabn" or "sodienthoai" or "socmnd" must be provided.');
        }

        const apiUrl = this.configService.get<string>('HOSPITAL_API_URL');

        const query = `
            query GetYLenhThuoc($mabn: String, $sodienthoai: String, $socmnd: String, $ngay: String) {
                ylenhthuoc(mabn: $mabn, sodienthoai: $sodienthoai, socmnd: $socmnd, ngay: $ngay) {
                    id, stt, ngay, sott, tenthuoc, thuchien, soluong, lieudung, thoidiem
                }
            }
        `;
        const variables = {
            mabn: user.mabn || null,
            sodienthoai: user.sodienthoai || null,
            socmnd: user.socmnd || null,
            ngay: date,
            namsinh: user.namsinh,
        };

        this.logger.debug(`Fetching treatments for mabn: ${user.mabn} on date: ${date}`);

        try {
            const response = await firstValueFrom(
                this.httpService.post(apiUrl!, { query, variables }, { timeout: 15000 })
            );

            if (response.data.errors) {
                throw new Error(JSON.stringify(response.data.errors));
            }
            return response.data.data.ylenhthuoc || [];
        } catch (error) {
            this.logger.error(`Failed to fetch ylenhthuoc from hospital API for user ${user.id}`, error.stack);
            throw new Error('Hospital API request failed.');
        }
    }

    async fetchPatientFromHospital(identifier: string): Promise<HospitalPatient | null> {
        const apiUrl = this.configService.get<string>('HOSPITAL_API_URL');

        let mabn = '', sodienthoai = '', socmnd = '';

        if (/^0\d{9,10}$/.test(identifier)) {
            sodienthoai = identifier;
        } else if (/^\d{12}$/.test(identifier)) {
            socmnd = identifier;
        } else if (/^\d{6,8}$/.test(identifier)) {
            mabn = identifier;
        }

        const query = `
            query {
                ylenhthuoc(
                    mabn: "${mabn}", 
                    sodienthoai: "${sodienthoai}", 
                    socmnd: "${socmnd}", 
                ) {
                    mabn,
                    sodienthoai,
                    socmnd,
                    namsinh
                }
            }
        `;

        try {
            const response = await firstValueFrom(
                this.httpService.post(apiUrl!, { query }, { timeout: 15000 })
            );

            const patientData = response.data?.data?.ylenhthuoc?.[0];
            return patientData || null;
        } catch (error) {
            this.logger.error('Failed to fetch patient from hospital API', error);
            return null;
        }
    }
}