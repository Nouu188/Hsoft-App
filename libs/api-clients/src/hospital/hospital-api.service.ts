import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { YLenhThuoc } from '@app/common/types/ylenhthuoc.interface';
import { Hospital } from 'apps/tenant-management-service/src/hospitals/entities/hospital.entity';
import { IdentityPayload } from 'apps/tenant-management-service/src/identities/dtos/identity.payload';
import { Gender } from 'apps/tenant-management-service/src/identities/entities/identity.entity';
import { firstValueFrom } from 'rxjs';
import { FetchClinicsResponse, HospitalClinicDto } from './dto/clinic.dto';
import { FetchDoctorsResponse } from './dto/doctor.dto';
import { HospitalPatient } from '../../../common/src/types/hospitalPatient.interface';
import { CreateIdentityInput } from 'apps/tenant-management-service/src/identities/dtos/create-identity-input.dto';

@Injectable()
export class HospitalApiClientService {
  private readonly logger = new Logger(HospitalApiClientService.name);

  constructor(private readonly httpService: HttpService) { }

  /**
   * Common executor for GraphQL requests
   */
  private async executeGraphQL<T>(
    graphqlEndpoint: string,
    query: string,
    variables: Record<string, any> = {},
    operationName?: string,
  ): Promise<T> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<{ data: T; errors?: any }>(
          graphqlEndpoint,
          { query, variables, operationName },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 20000,
          },
        ),
      );

      if (response.data.errors?.length) {
        this.logger.error(
          `[GraphQL] Errors from hospital API: ${JSON.stringify(response.data.errors)}`,
        );
        throw new InternalServerErrorException('Hospital API returned GraphQL errors');
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(
        `[GraphQL] Request failed. Query=${operationName || 'Unnamed'}, Variables=${JSON.stringify(
          variables,
        )}`,
        error.stack || error,
      );
      throw new InternalServerErrorException('Failed to communicate with Hospital API');
    }
  }

  async fetchYLenhThuoc(
    phoneNumber: string,
    graphqlEndpoint: string,
    ngay: string = '',
  ): Promise<YLenhThuoc[]> {
    if (!phoneNumber) {
      this.logger.error(`Missing phoneNumber for patient lookup`);
      throw new InternalServerErrorException(
        'Missing phoneNumber for patient lookup',
      );
    }

    const query = `
      query {
        ylenhthuoc(
          mabn: ""
          sodienthoai: "${phoneNumber}"
          socmnd: ""
          ngay: "${ngay}"
          namsinh: ""
        ) {
          mabn
          hoten
          namsinh
          socmnd
          sodienthoai
          id
          stt
          ngay
          sott
          tenthuoc
          thuchien
          songay
          soluong
          lieudung
          thoidiem
        }
      }
    `;

    this.logger.debug(
      `Fetching ylenhthuoc from ${graphqlEndpoint} | phone=${phoneNumber} | ngay=${ngay}`,
    );

    try {
      const data = await this.executeGraphQL<{ ylenhthuoc: YLenhThuoc[] }>(
        graphqlEndpoint,
        query,
      );

      const results = data.ylenhthuoc || [];

      this.logger.log(
        `Fetched ${results.length} ylenhthuoc records for phone=${phoneNumber}`,
      );

      if (results.length > 0) {
        this.logger.debug(
          `First record sample: ${JSON.stringify(results[0], null, 2)}`,
        );
      }

      return results;
    } catch (error) {
      this.logger.error(
        `Failed to fetch ylenhthuoc from ${graphqlEndpoint} | phone=${phoneNumber} | ngay=${ngay} | Error=${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to fetch ylenhthuoc');
    }
  }


  async fetchPatientFromHospital(
    phoneNumber: string,
    graphqlEndpoint: string,
    idNumber: string = "",
    birthYear: string = "",
  ): Promise<HospitalPatient | null> {
    const query = `
    {
      ylenhthuoc(
        mabn: ""
        sodienthoai: "${phoneNumber}"
        socmnd: "${idNumber}"
        ngay: ""
        namsinh: "${birthYear}"
      ) {
        mabn
        hoten
        namsinh
        socmnd
        sodienthoai
      }
    }
  `;

    try {
      this.logger.debug(
        `[fetchPatientFromHospital] Sending request to ${graphqlEndpoint}. Query=ylenhthuoc, phone=${phoneNumber}, idNumber=${idNumber}, birthYear=${birthYear}`,
      );

      const data = await this.executeGraphQL<{ ylenhthuoc: HospitalPatient[] }>(
        graphqlEndpoint,
        query,
      );

      if (!data?.ylenhthuoc || data.ylenhthuoc.length === 0) {
        this.logger.warn(
          `[fetchPatientFromHospital] Không tìm thấy bệnh nhân với phone=${phoneNumber}, endpoint=${graphqlEndpoint}`,
        );
        return null;
      }

      const patient = data.ylenhthuoc[0];
      this.logger.debug(
        `[fetchPatientFromHospital] Found patient mabn=${patient.mabn}, hoten=${patient.hoten}`,
      );

      return {
        mabn: patient.mabn ?? "",
        sodienthoai: patient.sodienthoai ?? phoneNumber,
        hoten: patient.hoten ?? "",
        socmnd: patient.socmnd ?? idNumber,
        namsinh: patient.namsinh ?? birthYear,
      };
    } catch (error) {
      const errorResponse =
        (error as any)?.response?.data ??
        (error as any)?.response ??
        error.message;

      this.logger.error(
        `[fetchPatientFromHospital] Lỗi khi gọi GraphQL endpoint=${graphqlEndpoint}, phone=${phoneNumber}. Response=${JSON.stringify(
          errorResponse,
        )}`,
        error.stack || error,
      );

      return null;
    }
  }

  /**
   * Fetch clinics from hospital
   */
  async fetchClinics(graphqlEndpoint: string): Promise<HospitalClinicDto[]> {
    const query = `
      query GetClinics($loai: String!, $makp: String!) {
        btdkp(loai: $loai, makp: $makp) {
          makp
          tenkp
        }
      }
    `;

    const data = await this.executeGraphQL<FetchClinicsResponse>(
      graphqlEndpoint,
      query,
      { loai: '', makp: '' },
      'GetClinics',
    );

    return data.btdkp || [];
  }

  /**
   * Fetch doctors from hospital
   */
  async fetchDoctors(graphqlEndpoint: string, externalDoctorCode: string = '') {
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

    const data = await this.executeGraphQL<FetchDoctorsResponse>(
      graphqlEndpoint,
      query,
      { loai: '', ma: externalDoctorCode },
      'GetDoctors',
    );

    if (!data.dmbs) return [];

    return data.dmbs.map((doctor) => ({
      mabs: doctor.ma,
      tenbs: doctor.hoten,
      makp: doctor.makp,
      avatar: doctor.hinhanh,
      gioithieu: `${doctor.giobd} - ${doctor.giokt}`,
    }));
  }
}

export function normalizeHospitalPatient(
  patient: HospitalPatient,
  linkedHospitals?: Hospital[],
): CreateIdentityInput {
  if (!patient) {
    throw new Error('Cannot normalize null patient data');
  }

  // --- Lấy birthYear từ namsinh (nếu có) ---
  let birthYear: number | undefined = undefined;
  if (patient.namsinh) {
    const year = parseInt(patient.namsinh, 10);
    if (!isNaN(year)) birthYear = year;
  }

  // --- Chuẩn hóa số điện thoại ---
  const phoneNumber = patient.sodienthoai?.trim() || undefined;

  // --- Chuẩn hóa số CMND/CCCD ---
  const nationalId = patient.socmnd?.trim() || undefined;

  // --- Xác định giới tính (nếu API có thông tin thì map, hiện tạm undefined) ---
  const gender: Gender | undefined = undefined; // nếu API trả gender thì map sang enum Gender

  // --- Chuẩn hóa tên ---
  const fullName = patient.hoten?.trim() || 'Unknown';

  // --- Payload ---
  const payload: CreateIdentityInput = {
    fullName,
    externalPatientCode: patient.mabn,
    gender,
    healthInsuranceNumber: undefined, // nếu có dữ liệu BHYT map vào đây
    phoneNumber,
    nationalId,
    address: undefined, // nếu API trả địa chỉ thì map vào
    birthYear,
    hospitals: linkedHospitals || [],
  };

  return payload;
}