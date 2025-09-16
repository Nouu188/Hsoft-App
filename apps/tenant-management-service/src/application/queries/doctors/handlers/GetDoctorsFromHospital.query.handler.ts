import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { NormalizedDoctorDataDto } from 'libs/normalizers/src/lib/doctor.normalizer';
import { GetDoctorsFromHospitalQuery } from '../GetDoctorsFromHospital.query';
import { DoctorPayload } from 'apps/tenant-management-service/src/domain';
import { HospitalApiClientService } from '@app/api-clients/hospital/hospital-api.service';

@QueryHandler(GetDoctorsFromHospitalQuery)
export class GetDoctorsFromHospitalHandler
  implements IQueryHandler<GetDoctorsFromHospitalQuery, DoctorPayload[]>
{
  private readonly logger = new Logger(GetDoctorsFromHospitalHandler.name);

  constructor(
    private readonly hospitalApiClient: HospitalApiClientService,
  ) {}

  async execute(query: GetDoctorsFromHospitalQuery): Promise<DoctorPayload[]> {
    const { graphqlEndpoint, clinicCode, doctorCode, date } = query;

    this.logger.debug(
      `Fetching doctors from endpoint=${graphqlEndpoint}, clinic=${clinicCode}, doctor=${doctorCode}, date=${date}`,
    );

    try {
      const doctors: ReadonlyArray<NormalizedDoctorDataDto> =
        await this.hospitalApiClient.fetchDoctors(
          graphqlEndpoint,
          clinicCode,
          doctorCode,
          date,
        );

      return doctors.map(GetDoctorsFromHospitalHandler.mapToPayload);
    } catch (error) {
      this.logger.error(
        `Failed to fetch doctors from endpoint=${graphqlEndpoint}, clinic=${clinicCode}, doctor=${doctorCode}, date=${date}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  private static mapToPayload(doctor: NormalizedDoctorDataDto): DoctorPayload {
    return {
      externalCode: doctor.externalCode,
      name: doctor.name,
      gender: doctor.gender,
      avatarUrl: doctor.avatarUrl,
      experience: doctor.experience,
      announcement: doctor.announcement,
      externalClinicCode: doctor.externalClinicCode,
      services: doctor.services.map(service => ({
        id: service.id,
        name: service.name,
        isHealthInsuranceApplied: service.isHealthInsuranceApplied,
        prices: {
          regular: service.prices.regular,
          healthInsurance: service.prices.healthInsurance,
        },
      })),
    };
  }
}
