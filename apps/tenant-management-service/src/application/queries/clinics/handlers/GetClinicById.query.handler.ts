import { Inject, Logger, InternalServerErrorException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Clinic, IClinicRepository } from "apps/tenant-management-service/src/domain";
import { GetActiveClinicsQuery } from "../GetActiveClinics.query";

@QueryHandler(GetActiveClinicsQuery)
export class GetActiveClinicsHandler implements IQueryHandler<GetActiveClinicsQuery, Clinic[]> {
  private readonly logger = new Logger(GetActiveClinicsHandler.name);

  constructor(
    @Inject(IClinicRepository) private readonly clinicRepo: IClinicRepository,
  ) {}

  async execute(query: GetActiveClinicsQuery): Promise<Clinic[]> {
    this.logger.log("Fetching all active clinics from the database...");

    try {
      const clinics = await this.clinicRepo.findAllActive();

      this.logger.log(`Successfully fetched ${clinics.length} active clinics.`);
      return clinics;
    } catch (error) {
      this.logger.error("Failed to fetch active clinics", error.stack);
      throw new InternalServerErrorException("Unable to fetch active clinics at the moment");
    }
  }
}
