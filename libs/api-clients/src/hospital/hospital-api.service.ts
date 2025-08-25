import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout } from 'rxjs';
import { User } from 'apps/account-service/src/users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { HospitalPatient } from './dto/hospitalPatient.dto';
import { YLenhThuoc } from 'apps/scheduling-service/src/doses/dto/ylenhthuoc.payload';
import { FetchClinicsResponse, HospitalClinicDto } from './dto/clinic.dto';
import { FetchDoctorsResponse, HospitalDoctorDto } from './dto/doctor.dto';

@Injectable()
export class HospitalApiClientService {
    private readonly logger = new Logger(HospitalApiClientService.name);
    private readonly hospitalApiUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.hospitalApiUrl = this.configService.get<string>('HOSPITAL_API_URL')!;
        if (!this.hospitalApiUrl) {
            throw new Error('Hospital API URL is not configured. Please check HOSPITAL_API_URL environment variable.');
        }
    }

    async fetchYLenhThuoc(user: User, ngay: string = ""): Promise<YLenhThuoc[]> {
        if (!user.sodienthoai && !user.socmnd) {
            throw new Error('Either "sodienthoai" or "socmnd" must be provided.');
        }

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
                this.httpService.post(this.hospitalApiUrl!, { query }, { timeout: 20000 })
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
                this.httpService.post(this.hospitalApiUrl!, { query }, { timeout: 20000 })
            );

            const patientData = response.data?.data?.ylenhthuoc?.[0];
            return patientData || null;
        } catch (error) {
            this.logger.error('Failed to fetch patient from hospital API', error);
            return null;
        }
    }

    async fetchClinics(): Promise<HospitalClinicDto[]> {
        const operationName = 'GetClinics';
        const query = `
            query GetClinics($loai: String!, $makp: String!) {
                btdkp(loai: $loai, makp: $makp) {
                    makp
                    tenkp
                }
            }
        `;

        const variables = {
            loai: "",
            makp: "",
        };

        const payload = {
            operationName,
            query,
            variables,
        };

        this.logger.log(`[API_CALL] Sending request to Hospital API to fetch clinics.`);
        this.logger.debug(`[API_CALL] Payload: ${JSON.stringify(payload)}`);

        try {
            interface GraphQLResponse<T> {
                data: T;
                errors?: any;
            }

            const response = await firstValueFrom(
                this.httpService.post<GraphQLResponse<FetchClinicsResponse>>(
                    this.hospitalApiUrl,
                    payload,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        timeout: 20000, // Tăng timeout cho các API bên ngoài
                    }
                )
            );

            if (response.data.errors) {
                this.logger.error('GraphQL errors received from Hospital API:', response.data.errors);
                // Ném lỗi để lớp gọi (ví dụ: SyncService) có thể bắt và xử lý
                throw new Error('Hospital API returned GraphQL errors.');
            }

            const clinics = response.data.data?.btdkp;

            if (!clinics) {
                this.logger.warn('[API_CALL] Hospital API response is valid but contains no clinic data.');
                return [];
            }

            this.logger.log(`[API_CALL] Successfully fetched ${clinics.length} clinics from Hospital API.`);
            return clinics;

        } catch (error) {
            this.logger.error(`[API_CALL] Failed to fetch clinics from Hospital API.`);

            // Log chi tiết lỗi để dễ dàng gỡ lỗi
            if (error.response) {
                // Lỗi từ phía server (ví dụ: 4xx, 5xx)
                this.logger.error(`- Status: ${error.response.status}`);
                this.logger.error(`- Data: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                // Request đã được gửi nhưng không nhận được phản hồi
                this.logger.error('- No response received. This could be a network issue, timeout, or DNS problem.');
                this.logger.error(`- Request URL: ${error.config.url}`);
            } else {
                // Lỗi xảy ra trong quá trình thiết lập request
                this.logger.error(`- Error Message: ${error.message}`);
            }

            // Ném lại lỗi để lớp gọi có thể xử lý (ví dụ: trong một cron job, nó có thể thử lại sau)
            throw new Error('Failed to communicate with Hospital API.');
        }
    }

    async fetchDoctors(mabs: string = "") {
        const operationName = 'GetDoctors';
        const query = `
      query GetDoctors($loai: String!, $ma: String!) {
        dmbs(loai: $loai, ma: $ma) {
          ma
          tenkp
          hinhanh
          hoten
          giobd
          giokt
          makp
        }
      }
    `;

        const variables = {
            loai: "", // Giá trị cố định, có thể thay đổi nếu cần
            ma: mabs,
        };

        const payload = {
            operationName,
            query,
            variables,
        };

        this.logger.log(`[API_CALL] Sending request to Hospital API to fetch doctors by mabs: '${mabs}'`);
        this.logger.debug(`[API_CALL] Payload: ${JSON.stringify(payload)}`);

        try {
            interface GraphQLDoctorsResponse {
                data: FetchDoctorsResponse;
                errors?: any;
            }

            const response = await firstValueFrom(
                this.httpService.post<GraphQLDoctorsResponse>(
                    this.hospitalApiUrl,
                    payload,
                    {
                        headers: { 'Content-Type': 'application/json' },
                        timeout: 20000,
                    }
                )
            );

            if (response.data.errors) {
                this.logger.error('GraphQL errors received from Hospital API while fetching doctors:', response.data.errors);
                throw new Error('Hospital API returned GraphQL errors.');
            }

            const doctors = response.data.data?.dmbs;

            if (!doctors) {
                this.logger.warn('[API_CALL] Hospital API response is valid but contains no doctor data.');
                return [];
            }

            this.logger.log(`[API_CALL] Successfully fetched ${doctors.length} doctors from Hospital API.`);

            const result = doctors.map(doctor => ({
                mabs: doctor.ma,
                tenbs: doctor.hoten,
                makp: doctor.makp,          
                avatar: doctor.hinhanh,
                gioithieu: `${doctor.giobd} - ${doctor.giokt}` // tùy bạn muốn format thế nào
            }))

            return result;

        } catch (error) {
            this.logger.error(`[API_CALL] Failed to fetch doctors from Hospital API.`);

            if (error.response) {
                this.logger.error(`- Status: ${error.response.status}`);
                this.logger.error(`- Data: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                this.logger.error('- No response received. Check network, timeout, or DNS.');
                this.logger.error(`- Request URL: ${error.config.url}`);
            } else {
                this.logger.error(`- Error Message: ${error.message}`);
            }

            throw new Error('Failed to communicate with Hospital API.');
        }
    }
}