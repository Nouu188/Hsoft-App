import { BadRequestException, Inject, Logger } from "@nestjs/common";
import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Dose, IDoseRepository } from "apps/scheduling-service/src/domain";
import { GetDosesBySelectedDateQuery } from "../impl/get-doses-by-selected-date.query";

@QueryHandler(GetDosesBySelectedDateQuery)
export class GetDosesBySelectedDateQueryHandler
    implements IQueryHandler<GetDosesBySelectedDateQuery, Dose[]> {
    private readonly logger = new Logger(GetDosesBySelectedDateQueryHandler.name);

    constructor(
        @Inject(IDoseRepository) private readonly doseRepo: IDoseRepository
    ) { }

    async execute(query: GetDosesBySelectedDateQuery): Promise<Dose[]> {
        const { selectedDate, userId } = query;

        this.logger.log(
            `Executing GetDosesBySelectedDateQuery for userId: ${userId}, selectedDate: ${selectedDate}`,
        );

        if (!userId || !selectedDate) {
            throw new BadRequestException("userId and selectedDate are required.");
        }

        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        this.logger.log(
            `Fetching doses from ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`,
        );

        const doses = await this.doseRepo.findByDateRangeAndUserId(
            startOfDay,
            endOfDay,
            userId
        );

        this.logger.log(
            `Found ${doses.length} doses for userId ${userId} on ${selectedDate}`,
        );

        return doses;
    }
}
