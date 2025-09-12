import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Dose, DoseStatus } from 'apps/scheduling-service copyy/src/doses/entities/dose.entity';

@Injectable()
export class DoseApiClientService {
  private readonly logger = new Logger(DoseApiClientService.name);
  private readonly schedulingServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.schedulingServiceUrl = this.configService.get<string>('SCHEDULING_SERVICE_URL')!;
    if (!this.schedulingServiceUrl) {
        throw new Error('SCHEDULING_SERVICE_URL is not defined in environment variables.');
    }
  }

  async syncDosesFromHospital(
    userId: string
  ): Promise<Boolean> {
    if(!userId) {
      throw new UnauthorizedException("Invalid userId");
    }

    const mutation = `
      mutation($userId: String!) {
        syncDosesFromHospital(userId: $userId)
      }
    `;

    const variables = { userId: userId};

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.schedulingServiceUrl, { mutation, variables })
      );

      if (response.data.errors) {
        throw new Error(JSON.stringify(response.data.errors));
      }

      return true;

    } catch (error) {
      this.logger.error(`Failed to synchronize doses from Scheduling Service`, error.message);
      return false; 
    }    
  }

  async fetchAndVerifyDoses(
    doseIds: string[],
    userId: string,
    status: DoseStatus,
  ): Promise<Dose[]> {
    if (!doseIds || doseIds.length === 0) {
      return [];
    }

    const query = `
      query GetDosesByIds($ids: [ID!]!) {
        dosesByIds(ids: $ids) {
          id
          userId
          status
          medication_name
          dosage_instructions
        }
      }
    `;
    const variables = { ids: doseIds };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.schedulingServiceUrl, { query, variables })
      );

      if (response.data.errors) {
        throw new Error(JSON.stringify(response.data.errors));
      }

      const fetchedDoses: Dose[] = response.data.data.dosesByIds_internal || [];

      const verifiedDoses = fetchedDoses.filter(dose => 
        dose.userId === userId && dose.status === status
      );

      return verifiedDoses;

    } catch (error) {
      this.logger.error(`Failed to fetch doses from Scheduling Service`, error.message);
      return []; 
    }
  }
}