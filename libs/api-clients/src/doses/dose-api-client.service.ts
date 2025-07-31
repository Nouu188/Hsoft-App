import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Dose, DoseStatus } from 'apps/scheduling-service/src/doses/entities/dose.entity';

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

  async fetchAndVerifyDoses(
    dose_ids: string[],
    user_id: string,
    status: DoseStatus,
  ): Promise<Dose[]> {
    if (!dose_ids || dose_ids.length === 0) {
      return [];
    }

    const query = `
      query GetDosesByIds($ids: [ID!]!) {
        dosesByIds(ids: $ids) {
          id
          user_id
          status
          medication_name
          dosage_instructions
        }
      }
    `;
    const variables = { ids: dose_ids };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.schedulingServiceUrl, { query, variables })
      );

      if (response.data.errors) {
        throw new Error(JSON.stringify(response.data.errors));
      }

      const fetchedDoses: Dose[] = response.data.data.dosesByIds_internal || [];

      const verifiedDoses = fetchedDoses.filter(dose => 
        dose.user_id === user_id && dose.status === status
      );

      return verifiedDoses;

    } catch (error) {
      this.logger.error(`Failed to fetch doses from Scheduling Service`, error.message);
      return []; 
    }
  }
}