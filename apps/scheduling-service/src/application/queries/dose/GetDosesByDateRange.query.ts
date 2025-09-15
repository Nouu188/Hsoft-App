import { IQuery } from "@nestjs/cqrs";

export class GetDosesByDateRangeQuery implements IQuery {
    constructor(
        public readonly startDate: Date, 
        public readonly endDate: Date,
        public readonly userId: string,
    ) {}
}