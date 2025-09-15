import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Inject, Logger, NotFoundException } from "@nestjs/common";
import { Hospital, IHospitalRepository } from "apps/tenant-management-service/src/domain";
import { GetHospitalByIdQuery } from "../GetHospitalById.query";

@QueryHandler(GetHospitalByIdQuery)
export class GetHospitalByIdHandler implements IQueryHandler<GetHospitalByIdQuery> {
    private readonly logger = new Logger(GetHospitalByIdHandler.name);

    constructor(
        @Inject(IHospitalRepository) 
        private readonly hospitalRepo: IHospitalRepository,
    ) {}

    async execute(query: GetHospitalByIdQuery): Promise<Hospital> {
        const { id } = query;
        this.logger.debug(`Executing GetHospitalByIdQuery with id=${id}`);

        const hospital = await this.hospitalRepo.findById(id);

        if (!hospital) {
            this.logger.warn(`Hospital not found with id=${id}`);
            throw new NotFoundException(`Hospital with id=${id} not found`);
        }

        this.logger.debug(`Successfully retrieved hospital with id=${id}`);
        return hospital;
    }
}
