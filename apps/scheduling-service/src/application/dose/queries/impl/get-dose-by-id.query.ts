import { IQuery } from "@nestjs/cqrs";

export class GetDoseByIdQuery implements IQuery {
    constructor(
        public readonly id: string, 
        public readonly userId: string,
    ) {}
}