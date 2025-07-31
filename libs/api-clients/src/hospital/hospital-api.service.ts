import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { User } from 'apps/account-service/src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

interface YLenhThuoc {
    id: string;
    stt: string;
    ngay: string; 
    sott: string;
    tenthuoc: string;
    thuchien: string;
    soluong: string;
    songay: string;
    lieudung: string; 
    thoidiem: string; 
}

export interface HospitalPatient {
    mabn: string;
    hoten: string;
    ngaysinh: string;
    diachi: string;
    sodienthoai: string;
    socmnd: string;
}

@Injectable()
export class HospitalApiClientService {
    private readonly logger = new Logger(HospitalApiClientService.name);
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {}
    
    async fetchYLenhThuoc(user: User, date: string): Promise<YLenhThuoc[]> {
        const apiUrl = this.configService.get<string>('HOSPITAL_API_URL');
        
        const query = `
            query GetYLenhThuoc($mabn: String, $sodienthoai: String, $socmnd: String, $ngay: String!) {
                ylenhthuoc(mabn: $mabn, sodienthoai: $sodienthoai, ngay: $ngay) {
                    id, stt, ngay, sott, tenthuoc, thuchien, soluong, lieudung, thoidiem
                }
            }
        `;
        const variables = {
            mabn: user.mabn || null,
            sodienthoai: user.sodienthoai || null,
            socmnd: user.socmnd || null,
            ngay: date,
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
    const apiKey = this.configService.get<string>('HOSPITAL_API_KEY');
    const apiUrl = this.configService.get<string>('HOSPITAL_API_URL');

    let mabn = '', sodienthoai = '', socmnd = '', sothe = '';

    if (/^0\d{9,10}$/.test(identifier)) {
        sodienthoai = identifier;
    } else if (/^\d{12}$/.test(identifier)) {
        socmnd = identifier;
    } else if (/^\d{6,8}$/.test(identifier)) {
        mabn = identifier;
    }

    const query = `
        query {
            btdbn(
                key: "${apiKey}", 
                mabn: "${mabn}", 
                sodienthoai: "${sodienthoai}", 
                socmnd: "${socmnd}", 
                sothe: "${sothe}"
            ) {
                mabn
                hoten
                ngaysinh
                diachi
                sodienthoai
                socmnd
            }
        }
    `;

    try {
        const response = await firstValueFrom(
            this.httpService.post(apiUrl!, { query })
        );

        const patientData = response.data?.data?.btdbn?.[0];
        return patientData || null;
    } catch (error) {
        this.logger.error('Failed to fetch patient from hospital API', error);
        return null;
    }
}

}