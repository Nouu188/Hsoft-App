import { IQuery } from "@nestjs/cqrs";

export class GetAllHospitalsQuery implements IQuery {
    constructor() {}
}