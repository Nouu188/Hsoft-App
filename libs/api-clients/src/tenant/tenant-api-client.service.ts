import {
  Injectable,
  Logger,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AuthApiClientService } from '../auth/auth-api-client.service';
import { Hospital } from 'apps/tenant-management-service/src/hospitals/entities/hospital.entity';
import { DoctorObjectType } from 'apps/tenant-management-service/src/doctors/dto/doctor.object-type';
import { ClinicObjectType } from 'apps/tenant-management-service/src/clinics/dto/clinic.object-type';
import { Identity } from 'apps/tenant-management-service/src/identities/entities/identity.entity';

@Injectable()
export class TenantApiClientService {
  private readonly logger = new Logger(TenantApiClientService.name);
  private readonly serviceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authApiClient: AuthApiClientService,
  ) {
    this.serviceUrl =
      this.configService.get<string>('TENANT_MANAGEMENT_SERVICE_URL')!;
  }

  private async executeGraphQL<T>(
    query: string,
    variables: Record<string, any> = {},
  ): Promise<T> {
    const m2mToken = await this.authApiClient.getM2MToken();

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.serviceUrl,
          { query, variables },
          { headers: { Authorization: `Bearer ${m2mToken}` } },
        ),
      );

      if (response.data.errors?.length) {
        this.logger.error(
          `GraphQL errors: ${JSON.stringify(response.data.errors)}`,
        );
        throw new InternalServerErrorException('GraphQL query failed');
      }

      return response.data.data as T;
    } catch (error) {
      this.logger.error(
        `GraphQL request failed. Query=${query}, Variables=${JSON.stringify(
          variables,
        )}`,
        error.stack || error,
      );
      throw new InternalServerErrorException(
        'Failed to communicate with Tenant Management Service',
      );
    }
  }

  async getActiveHospitals(): Promise<Hospital[]> {
    this.logger.debug(`Fetching active hospitals`);
    const query = `query {
      activeHospitals {
        id
        name
        code
        graphqlEndpoint
      }
    }`;

    const data = await this.executeGraphQL<{ activeHospitals: Hospital[] }>(
      query,
    );
    return data.activeHospitals;
  }

  async getHospitalById(hospitalId: string): Promise<Hospital> {
    this.logger.debug(`Fetching hospital by id=${hospitalId}`);
    const query = `
      query ($id: ID!) {
        hospital(id: $id) {
          id
          name
          code
          graphqlEndpoint
        }
      }
    `;

    const data = await this.executeGraphQL<{ hospital: Hospital }>(query, {
      id: hospitalId,
    });

    if (!data.hospital) {
      this.logger.warn(`Hospital with id=${hospitalId} not found`);
      throw new NotFoundException(`Hospital with id=${hospitalId} not found`);
    }

    return data.hospital;
  }

  async getDoctorById(doctorId: string): Promise<DoctorObjectType> {
    this.logger.debug(`Fetching doctor by id=${doctorId}`);
    const query = `
      query ($doctorId: ID!) {
        getDoctorById(doctorId: $doctorId) {
          id
          name
          avatarUrl
          bio
          clinics {
            id
            name
          }
        }
      }
    `;

    const data = await this.executeGraphQL<{
      getDoctorById: DoctorObjectType;
    }>(query, { doctorId });

    if (!data.getDoctorById) {
      this.logger.warn(`Doctor with id=${doctorId} not found`);
      throw new NotFoundException(`Doctor with id=${doctorId} not found`);
    }

    return data.getDoctorById;
  }

  async getClinicById(clinicId: string): Promise<ClinicObjectType> {
    this.logger.debug(`Fetching clinic by id=${clinicId}`);
    const query = `
      query ($clinicId: ID!) {
        getClinicById(clinicId: $clinicId) {
          id
          externalMakp
        }
      }
    `;

    const data = await this.executeGraphQL<{
      getClinicById: ClinicObjectType;
    }>(query, { clinicId });

    if (!data.getClinicById) {
      this.logger.warn(`Clinic with id=${clinicId} not found`);
      throw new NotFoundException(`Clinic with id=${clinicId} not found`);
    }

    return data.getClinicById;
  }

  async getHospitalUrlByCode(externalHospitalCode: string): Promise<string> {
    this.logger.debug(`Fetching GraphQL endpoint for hospital code=${externalHospitalCode}`);
    const query = `
      query ($externalHospitalCode: String!) {
        hospitalUrlByCode(externalHospitalCode: $externalHospitalCode) {
          graphqlEndpoint
        }
      }
    `;

    const data = await this.executeGraphQL<{ hospitalUrlByCode: Hospital }>(query, {
      externalHospitalCode,
    });

    if (!data.hospitalUrlByCode) {
      this.logger.warn(`Active hospital with externalHospitalCode=${externalHospitalCode} not found`);
      throw new NotFoundException(`Hospital with externalHospitalCode=${externalHospitalCode} not found`);
    }

    return data.hospitalUrlByCode.graphqlEndpoint;
  }

  async getIdentityByUserId(userId: string): Promise<Identity> {
    this.logger.debug(`Fetching Identity for userId=${userId}`);

    const query = `
      query ($userId: ID!) {
        identityByUserId(userId: $userId) {
          id
          userId
          fullName
          primaryPatientCode
          gender
          healthInsuranceNumber
          phoneNumber
          nationalId
          address
          avatarUrl
          birthYear
          createdAt
          updatedAt
          hospitals {
            id
            name
            code
            graphqlEndpoint
          }
        }
      }
    `;

    const data = await this.executeGraphQL<{ identityByUserId: Identity }>(
      query,
      { userId },
    );

    if (!data.identityByUserId) {
      this.logger.warn(`Identity not found for userId=${userId}`);
      throw new NotFoundException(`Identity not found for userId=${userId}`);
    }

    this.logger.debug(`Successfully fetched Identity for userId=${userId}`);
    return data.identityByUserId;
  }
}
