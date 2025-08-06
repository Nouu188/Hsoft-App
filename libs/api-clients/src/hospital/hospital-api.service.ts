import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';
import { User } from 'apps/account-service/src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { HospitalPatient } from './dto/hospitalPatient.dto';
import { YLenhThuoc } from 'apps/scheduling-service/src/doses/dto/ylenhthuoc.payload';

@Injectable()
export class HospitalApiClientService {
    private readonly logger = new Logger(HospitalApiClientService.name);
    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async fetchYLenhThuoc(user: User, ngay: string = ""): Promise<YLenhThuoc[]> {
        if (!user.sodienthoai && !user.socmnd) {
            throw new Error('Either "sodienthoai" or "socmnd" must be provided.');
        }

        const apiUrl = this.configService.get<string>('HOSPITAL_API_URL');

        const query = `
            query {
                ylenhthuoc(
                    mabn: "",
                    sodienthoai: "${user.sodienthoai || ""}",
                    socmnd: "${user.socmnd || ""}",
                    ngay: "${ngay}",
                    namsinh: "${user.namsinh || ""}"
                ) {
                    mabn, hoten, namsinh, socmnd, sodienthoai,
                    id, stt, ngay, sott, tenthuoc, thuchien,
                    songay, soluong, lieudung, thoidiem
                }
            }
        `;

        try {
            const response = await firstValueFrom(
                this.httpService.post(apiUrl!, { query }, { timeout: 15000 })
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

        let sodienthoai = '', socmnd = '';

        if (/^0\d{9,10}$/.test(identifier)) {
            sodienthoai = identifier;
        } else if (/^\d{12}$/.test(identifier)) {
            socmnd = identifier;
        } 

        const query = `
            query {
                ylenhthuoc(
                    mabn: "", 
                    sodienthoai: "${sodienthoai}", 
                    socmnd: "${socmnd}", 
                    namsinh: "",
                    ngay: "",
                ) {
                    mabn,
                    sodienthoai,
                    hoten,
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