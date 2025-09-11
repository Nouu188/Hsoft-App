import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetDoctorByIdQuery } from "../impl";
import { Doctor, IDoctorRepository } from "apps/tenant-management-service/src/domain";
import { Inject, Logger, NotFoundException, BadRequestException } from "@nestjs/common";

@QueryHandler(GetDoctorByIdQuery)
export class GetDoctorByIdHandler implements IQueryHandler<GetDoctorByIdQuery, Doctor> {
  private readonly logger = new Logger(GetDoctorByIdHandler.name);

  constructor(
    @Inject(IDoctorRepository) private readonly doctorRepo: IDoctorRepository,
  ) {}

  async execute(query: GetDoctorByIdQuery): Promise<Doctor> {
    const { doctorId } = query;

    if (!doctorId) {
      this.logger.warn("doctorId is missing in GetDoctorByIdQuery");
      throw new BadRequestException("Doctor ID must be provided");
    }

    this.logger.log(`Fetching doctor with ID: ${doctorId}`);

    const doctor = await this.doctorRepo.findById(doctorId);

    if (!doctor) {
      this.logger.warn(`Doctor not found with ID: ${doctorId}`);
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    this.logger.log(`Successfully retrieved doctor with ID: ${doctorId}`);
    return doctor;
  }
}
