import { Inject, Logger, NotFoundException } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { HospitalPayload, IHospitalRepository } from "apps/tenant-management-service/src/domain";
import { GetHospitalByExternalCodeQuery } from "../GetHospitalByExternalCode.query";

@QueryHandler(GetHospitalByExternalCodeQuery)
export class GetHospitalByExternalCodeHandler
  implements IQueryHandler<GetHospitalByExternalCodeQuery, HospitalPayload>
{
  private readonly logger = new Logger(GetHospitalByExternalCodeHandler.name);

  constructor(
    @Inject(IHospitalRepository)
    private readonly hospitalRepo: IHospitalRepository,
  ) {}

  async execute(query: GetHospitalByExternalCodeQuery): Promise<HospitalPayload> {
    const { externalCode } = query;
    this.logger.debug(`Handling GetHospitalByExternalCodeQuery: externalCode=${externalCode}`,);

    const hospital = await this.hospitalRepo.findByExternalCode(externalCode);

    if (!hospital) {
      this.logger.warn(`Hospital not found with externalCode=${externalCode}`);
      throw new NotFoundException(`Hospital with externalCode=${externalCode} not found`,);
    }

    this.logger.debug(`Successfully retrieved hospital with externalCode=${externalCode}`,);

    return hospital;
  }
}
