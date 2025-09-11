import { Inject, Logger, InternalServerErrorException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Clinic } from "apps/tenant-management-service/src/domain/clinics/entities";
import { GetActiveClinicsQuery } from "../impl";
import { IClinicRepository } from "apps/tenant-management-service/src/domain";

@QueryHandler(GetActiveClinicsQuery)
export class GetActiveClinicsHandler implements IQueryHandler<GetActiveClinicsQuery, Clinic[]> {
  private readonly logger = new Logger(GetActiveClinicsHandler.name);

  constructor(
    @Inject(IClinicRepository) private readonly clinicRepo: IClinicRepository,
  ) {}

  async execute(query: GetActiveClinicsQuery): Promise<Clinic[]> {
    this.logger.debug("Fetching all active clinics from the database...");

    try {
      const clinics = await this.clinicRepo.findAllActive();

      this.logger.log(`Found ${clinics.length} active clinic(s).`);
      return clinics;
    } catch (error) {
      this.logger.error("Error fetching active clinics", error.stack);
      throw new InternalServerErrorException("Unable to fetch active clinics");
    }
  }
}
