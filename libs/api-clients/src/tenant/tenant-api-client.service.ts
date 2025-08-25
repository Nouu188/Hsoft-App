import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AuthApiClientService } from '../auth/auth-api-client.service';
import { Hospital } from 'apps/tenant-management-service/src/hospitals/entities/hospital.entity';

@Injectable()
export class TenantApiClientService {
  private readonly logger = new Logger(TenantApiClientService.name);
  private readonly serviceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authApiClient: AuthApiClientService,
  ) {
    this.serviceUrl = this.configService.get<string>('TENANT_MANAGEMENT_SERVICE_URL')!;
  }

  async getActiveHospitals(): Promise<Hospital[]> {
    const m2mToken = await this.authApiClient.getM2MToken();
    const query = `query { activeHospitals { id name code graphqlEndpoint } }`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.serviceUrl, { query }, {
          headers: { Authorization: `Bearer ${m2mToken}` }
        })
      );
      return response.data.data.activeHospitals;
    } catch (error) {
      this.logger.error('Failed to fetch active hospitals', error);
      throw new Error('Could not communicate with Tenant Management Service');
    }
  }

  async getHospitalById(hospitalId: string): Promise<Hospital> {
    const m2mToken = await this.authApiClient.getM2MToken();
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

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          this.serviceUrl,
          { query, variables: { id: hospitalId } },
          { headers: { Authorization: `Bearer ${m2mToken}` } },
        ),
      );

      return response.data.data.hospital;
    } catch (error) {
      this.logger.error(`Failed to fetch hospital by id=${hospitalId}`, error);
      throw new Error('Could not fetch hospital from Tenant Management Service');
    }
  }
}