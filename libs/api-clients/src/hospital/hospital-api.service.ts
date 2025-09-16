import { YLenhThuoc } from '@app/common/types/ylenhthuoc.interface';
import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { md5Hash } from 'libs/crypto/src/md5-hasher';
import { mapHospitalGender } from 'libs/normalizers/src/lib/gender-mapper';
import { firstValueFrom } from 'rxjs';
import { FetchClinicsResponse, HospitalClinicDto } from './dto/clinic.dto';
import { FetchDoctorsResponse } from './dto/doctor.dto';
import { IdentityFromHospitalDto } from './dto/identity-from-hosital.dto';
import { HospitalPatient } from '@app/common/types';
import { NormalizedDoctorDataDto } from 'libs/normalizers/src/lib/doctor.normalizer';

@Injectable()
export class HospitalApiClientService {
  private readonly logger = new Logger(HospitalApiClientService.name);

  constructor(private readonly httpService: HttpService) { }

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

  async fetchIdentityFromHospital(
    phoneNumber: string,
    graphqlEndpoint: string,
    plainExternalCode: string,
    idNumber: string = "",
    birthYear: string = "",
  ): Promise<IdentityFromHospitalDto | null> {
    const key = md5Hash(plainExternalCode);
    this.logger.debug(`[fetchPatientFromHospital] MD5 key=${key} from input=${plainExternalCode}`);

    const query = `
      {
        btdbn(
          key: "${key}",
          mabn: "",
          sodienthoai: "${phoneNumber}",
          socmnd: "${idNumber}",
          sothe: ""
        ) {
          mabn
          hoten
          ngaysinh
          namsinh
          diachi
          sodienthoai
          socmnd
          diachi
          gioitinh
          sothe
          hinh
        }
      }
    `;

    try {
      this.logger.debug(
        `[fetchPatientFromHospital] Sending request to ${graphqlEndpoint}. Query=btdbn, phone=${phoneNumber}, idNumber=${idNumber}, birthYear=${birthYear}, externalCode=${plainExternalCode}`,
      );

      const data = await this.executeGraphQL<{ btdbn: HospitalPatient[] }>(
        graphqlEndpoint,
        query,
      );

      if (!data?.btdbn || data.btdbn.length === 0) {
        this.logger.warn(
          `[fetchPatientFromHospital] Không tìm thấy bệnh nhân với phone=${phoneNumber}, endpoint=${graphqlEndpoint}`,
        );
        return null;
      }

      const patient = data.btdbn[0];
      this.logger.debug(
        `[fetchPatientFromHospital] Found patient mabn=${patient.mabn}, hoten=${patient.hoten}`,
      );

      return {
        externalPatientCode: patient.mabn ?? "",
        phoneNumber: patient.sodienthoai ?? phoneNumber,
        fullName: patient.hoten ?? "",
        nationalId: patient.socmnd ?? idNumber,
        birthYear: patient.namsinh ? Number(patient.namsinh) : birthYear ? Number(birthYear) : undefined,
        gender: mapHospitalGender(patient.gioitinh),
        healthInsuranceNumber: patient.sothe ?? undefined,
        address: patient.diachi ?? undefined,
        avatarUrl: patient.hinh ?? undefined,
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

  async fetchDoctors(
    graphqlEndpoint: string,
    clinicCode: string = "",
    doctorCode: string = "",
    date: string = "",
  ): Promise<NormalizedDoctorDataDto[]> {
    const query = `
      {
        dmbsdangkykham(
          loai: "",
          ma: "${doctorCode || ""}",
          mapk: "${clinicCode || ""}",
          ngay: "${date}",
          nhompk: "",
          mabn: ""
        ) {
          ma, makp, tenkp, thongbao, hoten, bacsy, workername, pin, hienpin, hinhanh,
          kinhnghiem, phai, mavp, tenvp, gia_th, gia_bh, gia_dv, gia_cs, gia_nn,
          gia_ksk, bhyt, chenhlech, makpcl, benhvien, giobd, giokt
        }
      }
    `;

    const data = await this.executeGraphQL<FetchDoctorsResponse>(
      graphqlEndpoint,
      query,
    );

    if (!data.dmbsdangkykham) {
      this.logger.warn(
        `[fetchDoctors] No doctors found for clinic=${clinicCode}, date=${date}`,
      );
      return [];
    }

    const doctorsMap = new Map<string, NormalizedDoctorDataDto>();

    for (const record of data.dmbsdangkykham) {
      const doctorId = record.ma;

      if (!doctorsMap.has(doctorId)) {
        doctorsMap.set(doctorId, {
          externalCode: record.ma,
          name: record.hoten,
          gender: mapHospitalGender(record.phai),
          avatarUrl: this.normalizeAvatarUrl(record.hinhanh),
          experience: record.kinhnghiem || undefined,
          announcement: record.thongbao || undefined,
          pinCode: record.hienpin === '1' ? record.pin : undefined,
          externalClinicCode: record.makp,
          services: [],
        });
      }

      const doctor = doctorsMap.get(doctorId)!;
      doctor.services.push({
        id: record.mavp,
        name: record.tenvp,
        isHealthInsuranceApplied: parseFloat(record.bhyt) === 1.0,
        prices: {
          regular: parseFloat(record.gia_th) || 0,
          healthInsurance: parseFloat(record.gia_bh) || 0,
          service: parseFloat(record.gia_dv) || 0,
          foreigner: parseFloat(record.gia_nn) || 0,
        },
        rawData: {
          gia_cs: record.gia_cs,
          gia_ksk: record.gia_ksk,
          chenhlech: record.chenhlech,
          makpcl: record.makpcl,
        },
      });
    }

    return Array.from(doctorsMap.values());
  }

  private normalizeAvatarUrl(hinhanh: string | null): string | undefined {
    if (!hinhanh || hinhanh.startsWith('//')) {
      return undefined; // Hoặc một URL placeholder
    }
    // Thêm logic xử lý URL nếu cần
    return hinhanh;
  }
}
