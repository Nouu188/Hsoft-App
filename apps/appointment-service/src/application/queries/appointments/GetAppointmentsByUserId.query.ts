import { IQuery } from "@nestjs/cqrs";

export class GetAppointmentsByUserIdQuery implements IQuery {
    constructor (
        public readonly userId: string,
    ) { }
}