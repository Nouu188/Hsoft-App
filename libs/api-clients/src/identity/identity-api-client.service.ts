// libs/api-clients/src/identity/identity-api-client.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PatientIdentity, GetMyIdentityResponse } from './dto/patient-identity.dto';
import { AuthApiClientService } from '../auth/auth-api-client.service';

@Injectable()
export class PatientIdentityApiClientService {
  private readonly logger = new Logger(PatientIdentityApiClientService.name);
  private readonly serviceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authApiClient: AuthApiClientService,
  ) {
    this.serviceUrl = this.configService.get<string>('PATIENT_IDENTITY_SERVICE_URL')!;
    if (!this.serviceUrl) {
      throw new Error('Patient Identity Service URL is not configured. Please check PATIENT_IDENTITY_SERVICE_URL environment variable.');
    }
  }

  async getMyIdentity(): Promise<PatientIdentity | null> {
    const token = await this.authApiClient.getM2MToken();
    
    const operationName = 'GetMyIdentity';
    const query = `
      query GetMyIdentity {
        myIdentity {
          id
          userId
          fullName
          dob
          gender
          phoneNumber
          email
          idCardNumber
          bhytNumber
          address
        }
      }
    `;

    const payload = {
      operationName,
      query,
    };

    this.logger.log(`[API_CALL] Sending request to Patient Identity Service to fetch current user's identity.`);
    this.logger.debug(`[API_CALL] URL: ${this.serviceUrl}`);

    try {
      const response = await firstValueFrom(
        this.httpService.post<{ data: GetMyIdentityResponse, errors?: any; }>(
          this.serviceUrl,
          payload,
          {
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            },
            timeout: 10000,
          }   
        )
      );

      if (response.data.errors) {
        this.logger.error('GraphQL errors received from Patient Identity Service:', response.data.errors);
        return null;
      }

      const identity = response.data.data?.myIdentity;

      if (identity) {
        this.logger.log(`[API_CALL] Successfully fetched identity for user ${identity.userId}.`);
      } else {
        this.logger.log(`[API_CALL] No identity found for the current user.`);
      }
      
      return identity;

    } catch (error) {
      this.logger.error(`[API_CALL] Failed to fetch identity from Patient Identity Service.`);
      
      if (error.response) {
        this.logger.error(`- Status: ${error.response.status}`);
        this.logger.error(`- Data: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        this.logger.error('- No response received. Check network or service availability.');
      } else {
        this.logger.error(`- Error Message: ${error.message}`);
      }
      
      // Trong trường hợp lỗi giao tiếp, trả về null để không làm sập luồng nghiệp vụ chính
      return null;
    }
  }
}