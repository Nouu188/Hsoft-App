import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetAllHospitalsQuery } from "../impl";
import { Hospital } from "apps/tenant-management-service/src/domain/hospitals/entities";
import { Inject, Logger } from "@nestjs/common";
import { IHospitalRepository } from "apps/tenant-management-service/src/domain/hospitals/interfaces";

@QueryHandler(GetAllHospitalsQuery)
export class GetAllHospitalsHandler
  implements IQueryHandler<GetAllHospitalsQuery, Hospital[]>
{
  private readonly logger = new Logger(GetAllHospitalsHandler.name);

  constructor(
    @Inject(IHospitalRepository)
    private readonly hospitalRepo: IHospitalRepository,
  ) {}

  async execute(_query: GetAllHospitalsQuery): Promise<Hospital[]> {
    this.logger.debug(`Handling GetAllHospitalsQuery`);

    const hospitals = await this.hospitalRepo.findAll();

    if (!hospitals || hospitals.length === 0) {
      this.logger.warn(`No hospitals found`);
      return [];
    }

    this.logger.debug(`Found ${hospitals.length} hospitals`);
    return hospitals;
  }
}
