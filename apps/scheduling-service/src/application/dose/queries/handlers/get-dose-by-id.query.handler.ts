import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { GetDoseByIdQuery } from "../impl/get-dose-by-id.query";
import { Dose, IDoseRepository } from "apps/scheduling-service/src/domain";
import { Inject, Logger } from "@nestjs/common";

@QueryHandler(GetDoseByIdQuery)
export class GetDoseByIdQueryHandler implements IQueryHandler<GetDoseByIdQuery, Dose | null> {
    private readonly logger = new Logger(GetDoseByIdQueryHandler.name);

    constructor(
        @Inject(IDoseRepository) private readonly doseRepo: IDoseRepository
    ) {}

    async execute(query: GetDoseByIdQuery): Promise<Dose | null> {
        this.logger.log(`Executing GetDoseByIdQuery for id: ${query.id}, userId: ${query.userId}`);

        const dose = await this.doseRepo.findByIdAndUserId(query.id, query.userId);

        if (!dose) {
            this.logger.warn(`Dose not found or not owned by userId=${query.userId}, doseId=${query.id}`);
        }

        return dose;
    }
}
