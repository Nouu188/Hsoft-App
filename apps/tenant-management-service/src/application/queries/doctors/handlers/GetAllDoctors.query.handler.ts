import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject, Logger, InternalServerErrorException } from "@nestjs/common";
import { Doctor, IDoctorRepository } from "apps/tenant-management-service/src/domain";
import { GetAllDoctorsQuery } from "../GetAllDoctors.query";

@QueryHandler(GetAllDoctorsQuery)
export class GetAllDoctorsHandler implements IQueryHandler<GetAllDoctorsQuery, Doctor[]> {
  private readonly logger = new Logger(GetAllDoctorsHandler.name);

  constructor(
    @Inject(IDoctorRepository) private readonly doctorRepo: IDoctorRepository,
  ) {}

  async execute(query: GetAllDoctorsQuery): Promise<Doctor[]> {
    this.logger.log("Fetching all doctors...");

    try {
      const doctors = await this.doctorRepo.findAll();

      this.logger.log(`Successfully fetched ${doctors.length} doctors.`);
      return doctors;
    } catch (error) {
      this.logger.error("Failed to fetch doctors", error.stack);
      throw new InternalServerErrorException("Unable to fetch doctors at the moment");
    }
  }
}
