import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { Dose, IDoseRepository } from "apps/scheduling-service/src/domain";
import { BadRequestException, Inject, Logger } from "@nestjs/common";
import { GetDosesByDateRangeQuery } from "../GetDosesByDateRange.query";

@QueryHandler(GetDosesByDateRangeQuery)
export class GetDosesByDateRangeQueryHandler
  implements IQueryHandler<GetDosesByDateRangeQuery, Dose[]>
{
  private readonly logger = new Logger(GetDosesByDateRangeQueryHandler.name);

  constructor(
    @Inject(IDoseRepository) private readonly doseRepo: IDoseRepository
  ) {}

  async execute(query: GetDosesByDateRangeQuery): Promise<Dose[]> {
    const { userId, startDate, endDate } = query;

    this.logger.log(
      `Executing GetDosesByDateRangeQuery for userId: ${userId}, startDate: ${startDate}, endDate: ${endDate}`,
    );

    if (!userId || !startDate || !endDate) {
      throw new BadRequestException(
        "userId, startDate, and endDate are required.",
      );
    }

    if (startDate > endDate) {
      throw new BadRequestException("startDate cannot be after endDate.");
    }

    const doses = await this.doseRepo.findByDateRangeAndUserId(startDate, endDate, userId);

    this.logger.log(`Found ${doses.length} doses for userId ${userId}`);

    return doses;
  }
}
