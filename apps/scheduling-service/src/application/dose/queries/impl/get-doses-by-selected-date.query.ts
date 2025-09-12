import { IQuery } from "@nestjs/cqrs";

export class GetDosesBySelectedDateQuery implements IQuery {
    constructor(
        public readonly selectedDate: Date, 
        public readonly userId: string,
    ) {}
}